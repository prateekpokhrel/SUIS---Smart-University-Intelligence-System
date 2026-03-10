"""
SUIS Auth & User API (port 8004)
- Verifies Supabase JWT
- GET/PATCH /users/me for profile
"""
import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from pydantic import BaseModel
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")

try:
    import jwt
except ImportError:
    jwt = None

from supabase_client import supabase

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    print("⚠️ SUPABASE_JWT_SECRET not set — JWT verification disabled; set it in .env for production.")

app = FastAPI(title="SUIS Auth & User API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    year: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = credentials.credentials
    if not SUPABASE_JWT_SECRET or not jwt:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth not configured (SUPABASE_JWT_SECRET / PyJWT)",
        )
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            audience="authenticated",
            algorithms=["HS256"],
        )
        return {"sub": payload.get("sub"), "email": payload.get("email")}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@app.get("/")
def home():
    return {"status": "SUIS Auth & User API", "docs": "/docs"}


@app.get("/users/me")
def get_me(claims: dict = Depends(verify_token)):
    user_id = claims["sub"]
    r = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return r.data[0]


@app.patch("/users/me")
def update_me(body: ProfileUpdate, claims: dict = Depends(verify_token)):
    user_id = claims["sub"]
    data = body.model_dump(exclude_unset=True)
    if not data:
        return supabase.table("profiles").select("*").eq("id", user_id).execute().data[0]
    r = supabase.table("profiles").update(data).eq("id", user_id).execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return r.data[0]
