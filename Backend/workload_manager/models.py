from pydantic import BaseModel
from typing import List

class JiraAuth(BaseModel):
    email: str
    api_token: str
    domain: str

class Task(BaseModel):
    title: str
    hours: float
    subject: str
    deadline: str
