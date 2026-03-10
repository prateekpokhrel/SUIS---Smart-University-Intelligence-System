from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
import os
import shutil

app = FastAPI(title="CampusShield Emergency API")

# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= STORAGE =================

UPLOAD_DIR = "emergency_uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# ================= MEMORY DATABASE =================

emergencies: List[dict] = []

# ================= REPORT EMERGENCY =================

@app.post("/emergency/report")
async def report_emergency(
    role: str = Form(...),
    type: str = Form(...),
    category: Optional[str] = Form(None),
    severity: Optional[str] = Form("Medium"),
    student: Optional[str] = Form(None),
    silent_mode: Optional[bool] = Form(False),
    notify_parent: Optional[bool] = Form(False),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
):

    emergency_id = len(emergencies) + 1

    image_path = None
    audio_path = None

    # Save image
    if image:
        image_path = os.path.join(UPLOAD_DIR, f"{emergency_id}_{image.filename}")
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    # Save audio
    if audio:
        audio_path = os.path.join(UPLOAD_DIR, f"{emergency_id}_{audio.filename}")
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

    emergency_data = {
        "id": emergency_id,
        "role": role,
        "category": category,
        "type": type,
        "severity": severity,
        "student": student,
        "silent_mode": silent_mode,
        "notify_parent": notify_parent,
        "lat": lat,
        "lng": lng,
        "image": image_path,
        "audio": audio_path,
        "status": "Active",
        "created_at": datetime.utcnow().isoformat()
    }

    emergencies.append(emergency_data)

    return {
        "message": "Emergency reported successfully",
        "id": emergency_id
    }

# ================= GET ALL =================

@app.get("/emergency/all")
def get_all_emergencies():
    return emergencies

# ================= DISPATCH =================

@app.post("/emergency/dispatch/{emergency_id}")
def dispatch_emergency(emergency_id: int):

    for emergency in emergencies:
        if emergency["id"] == emergency_id:
            emergency["status"] = "Dispatched"
            return {"message": "Emergency dispatched"}

    return {"error": "Emergency not found"}

# ================= RESOLVE =================

@app.post("/emergency/resolve/{emergency_id}")
def resolve_emergency(emergency_id: int):

    for emergency in emergencies:
        if emergency["id"] == emergency_id:
            emergency["status"] = "Resolved"
            return {"message": "Emergency resolved"}

    return {"error": "Emergency not found"}
