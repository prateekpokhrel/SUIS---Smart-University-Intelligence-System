import os
from fastapi import FastAPI
import uvicorn

from app import app as career_app
from spam_detection import app as spam_app
from workload import app as workload_app
from SEGA.server import app as emergency_app
from auth_api import app as auth_app

app = FastAPI(title="SUIS Backend Gateway")

app.mount("/career", career_app)
app.mount("/spam", spam_app)
app.mount("/workload", workload_app)
app.mount("/sega", emergency_app)
app.mount("/auth", auth_app)

PORT = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)