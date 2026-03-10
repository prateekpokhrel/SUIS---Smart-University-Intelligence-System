from fastapi import FastAPI
from pydantic import BaseModel
from uuid import uuid4
from typing import List

app = FastAPI()

class Emergency(BaseModel):
    role: str
    type: str
    lat: float
    lng: float

db = []

@app.post("/emergency/trigger")
def trigger_emergency(e: Emergency):
    incident = {
        "id": str(uuid4()),
        "role": e.role,
        "type": e.type,
        "lat": e.lat,
        "lng": e.lng,
        "status": "Pending"
    }
    db.append(incident)
    return {"message": "Emergency Alert Sent Successfully"}

@app.get("/emergency/all")
def get_all():
    return db

@app.post("/emergency/dispatch/{incident_id}")
def dispatch(incident_id: str):
    for i in db:
        if i["id"] == incident_id:
            i["status"] = "Staff Dispatched"
    return {"message": "Staff Assigned"}
