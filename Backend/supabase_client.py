import os
from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("Supabase URL loaded:", bool(SUPABASE_URL))
print("Supabase KEY loaded:", bool(SUPABASE_KEY))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase env vars missing")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
