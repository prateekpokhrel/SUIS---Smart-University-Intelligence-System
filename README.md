# SUIS — Student University Intelligence System

Project SUIS is a full-stack web application to support students, teachers and administrators with career prediction, university and scholarship recommendations, mentorship/mentee management, peer-group formation, and teacher workload balancing. This repository contains the Frontend (React + Vite), Backend (Python), ML artifacts, and supporting utilities.

**Table of contents**
- Project overview
- Features
- Architecture
- Components and important files
- Installation & run (local)
- How to use (role-based)
- Data & models
- Functional requirements (SRS-ready)
- Non-functional requirements
- Security & privacy
- Testing & validation
- Deployment notes
- Known limitations & next steps

## Project overview

Purpose: Provide an integrated system that helps students discover suitable careers and universities, helps administrators and teachers manage students effectively, and supports mentorship and peer-group formation.

Scope: Prediction pipelines (ML), a web front-end for users (students, teachers, admins), REST and Fast APIs for integrations, and utilities for exporting reports and detecting spam.

## Features (what we built)

- **Career Prediction:** ML-based career recommender to suggest career paths for students, powered by a trained model stored in the Backend folder.
- **SEGA**: A **role-based emergency governance infrastructure** integrated inside SUIS to manage campus emergency incidents in real time. It provides a **structured reporting and escalation mechanism** between students, teachers, and administrators.
- **Career Suggestion Roadmap:** Suggested learning and course roadmap to reach recommended careers (frontend UI component around CareerPrediction).
- **Scholarship Recommendations:** Display available scholarship opportunities relevant to students’ profiles.
- **Admin Panel:** Full overview for administrators to view university details and system-wide data.
- **User / Student Panel:** Students can view predictions, recommendations, and personal analytics.
- **Mentee Panel:** Mentors/admins can view all mentees and their profiles to support peer group formation.
- **Peer Group Formation:** Tools for grouping students into peer cohorts based on profiles and risk metrics.
- **Teacher Load Balancer:** Features for teachers to view load and distribute mentoring/assessment tasks fairly.
- **Spam Detection:** Backend utility for filtering spam (see spam_detection module).
- **Reporting & Export:** CSV/PDF export utilities to generate reports for stakeholders.

## Architecture

- **Frontend:** React + Vite project in the `Frontend` folder. Core pages and components live under `Frontend/src/pages` and `Frontend/src/components`.
- **Backend:** Python Flask (or similar) app in the `Backend` folder (`app.py`, `main.py`) exposing APIs consumed by the frontend. Dependencies listed in `Backend/requirements.txt`.
- **ML Models:** Pre-trained model artifacts in the `Backend` folder (for example `career_recommender_FINAL_v2.joblib`).
- **Database:** Application expects a DB layer (not included in this repo snapshot) — adjust configuration in the backend to connect to your database.

## Components and important files

- Frontend entry: [Frontend/src/main.jsx](Frontend/src/main.jsx)
- Frontend app: [Frontend/src/App.jsx](Frontend/src/App.jsx)
- Student pages: [Frontend/src/pages/student/CareerPrediction.jsx](Frontend/src/pages/student/CareerPrediction.jsx) and related student pages
- Backend API: [Backend/app.py](Backend/app.py) and [Backend/main.py](Backend/main.py)
- Spam detection utility: [Backend/spam_detection.py](Backend/spam_detection.py)
- ML model artifact: [Backend/career_recommender_FINAL_v2.joblib](Backend/career_recommender_FINAL_v2.joblib)
- Backend requirements: [Backend/requirements.txt](Backend/requirements.txt)
- Frontend package: [Frontend/package.json](Frontend/package.json)

## Installation & run (local)

Prerequisites: Python 3.8+, Node.js 16+ (or LTS), Git.

Backend (Windows example):

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# then run the API (adjust if `main.py` is the entry):
python app.py
```

Frontend (Windows example):

```powershell
cd Frontend
npm install
npm run dev
```

Notes: Verify API base URL in `Frontend/src/firebase.js` or any config pointing to the backend.

## How to use (role-based)

- **Admin:** Access admin panel to view and manage university details, scholarships, user accounts, and system-wide reports.
- **Student/User:** Use the Career Prediction page to get career recommendations, view suggested learning roadmaps, and see matched scholarships.
- **Mentor/Mentee:** Mentors can open the Mentee Panel to view assigned mentees, their progress, and form peer groups for collaborative learning.
- **Teacher:** Use teacher dashboards for class performance, at-risk lists, and load balancing tools to evenly distribute supervision.

## Data & models

- Training/Model artifact: `Backend/career_recommender_FINAL_v2.joblib` — a serialized model used for career recommendations.
- Input data: student academic records, demographic attributes, and other behavioral features (update pipeline if your field names differ).
- Spam filtering: implemented in `Backend/spam_detection.py` to cleanse user-submitted content.

## Functional requirements (SRS-style brief)

- FR1: The system shall accept a student profile and return a ranked list of suitable careers.
- FR2: The system shall provide a career suggestion roadmap for each recommended career.
- FR3: The admin shall view and manage universities and scholarship listings.
- FR4: Mentors shall view and manage mentees; form peer groups and export mentee reports.
- FR5: Teachers shall view load summaries and rebalance assignments.
- FR6: The frontend shall consume backend REST APIs for predictions, user management, and reports.

## Non-functional requirements

- Performance: Prediction API should respond within acceptable SLA (e.g., < 2 seconds) for typical requests.
- Scalability: Backend designed to be horizontally scalable behind a load balancer.
- Reliability: Data backups and monitoring recommended for production.
- Accessibility: Frontend UI should follow accessible design (ARIA where appropriate).

## Security & privacy

- Use HTTPS in production.
- Secure model and dataset files and limit access to PII.
- Follow applicable data protection laws (e.g., GDPR) for student data.

## Testing & validation

- Unit tests: Add tests for backend endpoints and model inputs/outputs.
- Model validation: Evaluate model accuracy, precision/recall on separate holdout set before deployment.
- Integration tests: Frontend <-> Backend flows (login, prediction request, report export).

## Deployment notes

- Backend: Containerize the backend (Dockerfile) and deploy behind a reverse proxy (NGINX) with TLS.
- Frontend: Build static assets (`npm run build`) and serve via CDN or static web host.
- CI/CD: Add pipelines to run tests, build, and deploy artifacts.

## Known limitations & next steps

- Add clear database schema and migrations.
- Add RBAC to secure admin/teacher/mentor endpoints.
- Expand ML explainability: include confidence scores and feature importances for recommendations.
- Add automated tests and CI.

## Authors and their Contributions:
- Pratik Pokhrel, **Contribution**: Backend Implementation using FastAPI, **SEGA**, **Role based Logins**, Act as mentor For developing Entire frontend of the SUIS
- Adarsh Raj Poudel, **Contribution**: Lead on Database Implementation, Co-mentor on Backend and rest.
- Unish Xetri, **Contribution**: Spam Detection
- Sanskar Dumre, **Contribution**: Peer Group concept and some sorts of frontend
- Prashish Yadav, **Contribution**: ML modelling and all
- Ramesh Adhikari, **Contribution**: All Research and Paper Works 

All rights are reserved under these poeple.

---

Generated on: 2026-01-26



