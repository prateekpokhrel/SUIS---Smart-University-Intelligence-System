import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import uuid

app = FastAPI(title="SUIS SEGA Emergency Server")

# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= FILE STORAGE =================
# Create an 'uploads' directory to actually save the images and audio
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the folder so the frontend can access the files via URL
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ================= IN-MEMORY DATABASE =================

incidents = []
banned_students = set()

# ================= MODELS (Simple) =================

def create_incident(data):
    data["id"] = str(uuid.uuid4())
    data["status"] = "Active"
    data["created_at"] = datetime.utcnow()
    incidents.append(data)
    return data

# =====================================================
# ================= STUDENT REPORT ====================
# =====================================================

@app.post("/emergency/report")
async def report_emergency(
    role: str = Form(...),
    category: str = Form(...),
    type: str = Form(...),
    explanation: str = Form(None),
    location: str = Form(None),        # ADDED: Catch GPS location
    route_to: str = Form(None),        # ADDED: Catch routing info
    roll_number: str = Form(None),
    image: UploadFile = File(None),
    audio: UploadFile = File(None),    # FIXED: Was 'voice', now matches frontend 'audio'
):

    if roll_number and roll_number in banned_students:
        return {"error": "Student is temporarily banned from SEGA."}

    # Save Image to disk
    image_url = None
    if image and image.filename:
        # Create a unique filename so files don't overwrite each other
        unique_image_name = f"{uuid.uuid4().hex}_{image.filename}"
        image_path = os.path.join(UPLOAD_DIR, unique_image_name)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{unique_image_name}"

    # Save Audio to disk
    audio_url = None
    if audio and audio.filename:
        unique_audio_name = f"{uuid.uuid4().hex}_{audio.filename}"
        audio_path = os.path.join(UPLOAD_DIR, unique_audio_name)
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        audio_url = f"/uploads/{unique_audio_name}"

    incident = {
        "role": role,
        "category": category,
        "type": type,
        "explanation": explanation,
        "location": location,
        "route_to": route_to,
        "roll_number": roll_number,
        "image_url": image_url,   # Now sends actual URL to Teacher
        "audio_url": audio_url,   # Now sends actual URL to Teacher
    }

    return create_incident(incident)

# =====================================================
# ================= GET ALL INCIDENTS =================
# =====================================================

@app.get("/emergency/all")
def get_all():
    return incidents

# =====================================================
# ================= RESOLVE (Teacher) =================
# =====================================================

@app.post("/emergency/resolve/{incident_id}")
def resolve_incident(incident_id: str):
    for i in incidents:
        if i["id"] == incident_id:
            i["status"] = "Resolved"
            return {"message": "Resolved"}
    return {"error": "Not found"}

# =====================================================
# ================= ESCALATE (Teacher) ================
# =====================================================

@app.post("/emergency/escalate/{incident_id}")
def escalate_incident(incident_id: str):
    for i in incidents:
        if i["id"] == incident_id:
            i["status"] = "Escalated to Admin"
            return {"message": "Escalated"}
    return {"error": "Not found"}

# =====================================================
# ================= DISPATCH (Admin) ==================
# =====================================================

@app.post("/emergency/dispatch/{incident_id}")
def dispatch_team(incident_id: str):
    for i in incidents:
        if i["id"] == incident_id:
            i["status"] = "Emergency Team Dispatched"
            return {"message": "Team Dispatched"}
    return {"error": "Not found"}

# =====================================================
# ================= BAN STUDENT =======================
# =====================================================

@app.post("/emergency/ban/{roll_number}")
def ban_student(roll_number: str):
    banned_students.add(roll_number)
    return {"message": f"Student {roll_number} banned"}

@app.post("/emergency/unban/{roll_number}")
def unban_student(roll_number: str):
    banned_students.discard(roll_number)
    return {"message": f"Student {roll_number} unbanned"}

# =====================================================
# ================= HEALTH CHECK ======================
# =====================================================

@app.get("/")
def root():
    return {"status": "SUIS SEGA Server Running"}