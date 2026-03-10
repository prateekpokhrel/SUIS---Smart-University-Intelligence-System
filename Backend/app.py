from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# ✅ NEW — Supabase
import os
from supabase_client import supabase


from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

from supabase_client import supabase


# ---------------- App ----------------
app = FastAPI(title="Career Recommendation API (Branch Specific)")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Load Branch Models ----------------
MODELS = {
    "CSE": joblib.load("cse_career_model_v1.1.pkl"),
    "CIVIL": joblib.load("civil_career_model_v1.0.pkl"),
    "ECE": joblib.load("ece_career_model_v1.0.pkl"),
    "MECH": joblib.load("mech_career_model_v1.0.pkl"),
}

# ---------------- Input Schema ----------------
class StudentProfile(BaseModel):
    Branch: str
    Current_Year: int
    Programming_Languages: str
    Technical_Skills: str
    Tools_Frameworks: str
    Skill_Proficiency: str
    Career_Preference: str
    Research_Or_Industry: str
    Aptitude_Score: int
    Communication_Skill: int
    Risk_Tolerance: int


# ---------------- Column Mapping ----------------
RENAME_MAP = {
    "Current_Year": "current_year",
    "Programming_Languages": "programming_languages",
    "Technical_Skills": "technical_skills",
    "Tools_Frameworks": "tools_frameworks",
    "Skill_Proficiency": "skill_proficiency",
    "Career_Preference": "career_preference",
    "Research_Or_Industry": "research_or_industry",
    "Aptitude_Score": "aptitude_score",
    "Communication_Skill": "communication_skill",
    "Risk_Tolerance": "risk_tolerance",
}


def get_expected_columns(model):
    if hasattr(model, "feature_names_in_"):
        return list(model.feature_names_in_)
    if hasattr(model, "named_steps") and "preprocessor" in model.named_steps:
        pre = model.named_steps["preprocessor"]
        if hasattr(pre, "feature_names_in_"):
            return list(pre.feature_names_in_)
    return None


def prepare_input_dataframe(profile: StudentProfile, model):
    df = pd.DataFrame([profile.model_dump()])
    df = df.rename(columns=RENAME_MAP)
    df = df.drop(columns=["Branch"], errors="ignore")

    expected_cols = get_expected_columns(model)
    if expected_cols is None:
        return df

    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0

    df = df[expected_cols]
    return df


def recommend(profile: StudentProfile, top_n: int = 3):
    branch = profile.Branch.strip().upper()

    if branch not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Branch='{profile.Branch}'. Allowed: {list(MODELS.keys())}"
        )

    model = MODELS[branch]

    if not hasattr(model, "predict_proba"):
        raise HTTPException(
            status_code=500,
            detail=f"Model for '{branch}' does not support predict_proba()"
        )

    df = prepare_input_dataframe(profile, model)

    probs = model.predict_proba(df)[0]
    labels = model.classes_

    ranked = sorted(zip(labels, probs), key=lambda x: x[1], reverse=True)[:top_n]
    total = sum(score for _, score in ranked) or 1.0

    return [
        {"career": str(career), "matching_score": round((score / total) * 100, 2)}
        for career, score in ranked
    ]


# ================== SAVE TO SUPABASE ==================

def save_prediction_to_db(profile: StudentProfile, recs, user_id=None):
    try:
        top = recs[0] if recs else {}
        insert_data = {
            "user_id": user_id,
            "branch": profile.Branch.strip().upper(),
            "current_year": profile.Current_Year,
            "programming_languages": profile.Programming_Languages,
            "technical_skills": profile.Technical_Skills,
            "tools_frameworks": profile.Tools_Frameworks,
            "skill_proficiency": profile.Skill_Proficiency,
            "career_preference": profile.Career_Preference,
            "research_or_industry": profile.Research_Or_Industry,
            "aptitude_score": profile.Aptitude_Score,
            "communication_skill": profile.Communication_Skill,
            "risk_tolerance": profile.Risk_Tolerance,
            "top_career": top.get("career"),
            "top_match_score": top.get("matching_score"),
            "recommendations": recs
        }

        supabase.table("career_predictions").insert(insert_data).execute()
    except Exception as e:
        print("❌ DB save failed:", e)


# ================== ROUTES ==================

@app.get("/")
def home():
    return {"status": "Career Recommendation API is running ✅"}


@app.post("/predict")
def predict(profile: StudentProfile, request: Request):
    branch = profile.Branch.strip().upper()
    results = recommend(profile, top_n=3)

    # Optional: frontend sends X-User-Id (Supabase user UUID) so we store with user
    user_id = request.headers.get("X-User-Id") or None
    if user_id and len(user_id) == 36 and user_id.count("-") == 4:
        save_prediction_to_db(profile, results, user_id=user_id)
    else:
        save_prediction_to_db(profile, results)

    return {
        "branch_used": branch,
        "top_recommendations": results,
    }
