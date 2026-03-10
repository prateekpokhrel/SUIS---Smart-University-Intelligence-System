from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import itertools
from datetime import date

app = FastAPI(title="SUIS Workload API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= IN-MEMORY DB =================

task_id_counter = itertools.count(1)
TASKS = []

# ================= MODELS =================

class TaskIn(BaseModel):
    title: str
    subject: str
    hours: int
    deadline: str
    assignedTo: str  # student / teacher


class AnalyzeIn(BaseModel):
    tasks: List[dict]


# ================= ROUTES =================

@app.post("/task/assign")
def assign_task(t: TaskIn):
    task = t.dict()
    task["id"] = next(task_id_counter)
    task["status"] = "assigned"
    task["created"] = str(date.today())
    TASKS.append(task)
    return {"ok": True, "task": task}


@app.get("/task/my")
def my_tasks(role: str):
    return [t for t in TASKS if t["assignedTo"] == role]


@app.delete("/task/delete/{task_id}")
def delete_task(task_id: int):
    global TASKS
    TASKS = [t for t in TASKS if t["id"] != task_id]
    return {"ok": True}


@app.put("/task/extend/{task_id}")
def extend_deadline(task_id: int, new_deadline: str):
    for t in TASKS:
        if t["id"] == task_id:
            t["deadline"] = new_deadline
            return {"ok": True}
    return {"ok": False}


@app.post("/workload/analyze")
def analyze(inp: AnalyzeIn):

    total = sum(t.get("hours", 0) for t in inp.tasks)

    if total < 10:
        level = "Light"
    elif total < 25:
        level = "Medium"
    else:
        level = "Heavy"

    return {
        "score": total,
        "level": level,
        "category": (
            "Underloaded" if total < 10
            else "Balanced" if total <= 25
            else "Overloaded"
        ),
        "overload": total > 35
    }
