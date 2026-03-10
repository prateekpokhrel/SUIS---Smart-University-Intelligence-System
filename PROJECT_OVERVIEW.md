# SUIS – Smart University Intelligence System  
## Project Overview (For Teacher / Presentation)

This document explains the entire SUIS project: frontend, backend, how Supabase is used, all features, applications, prediction models, and outcomes.

---

## 1. What is SUIS?

**SUIS** stands for **Smart University Intelligence System**. It is a web application that provides:

- **Students:** Career prediction, career path tracking, spam mail detection, emergency reporting (SEGA), courses, peer groups, risk view, and settings.
- **Teachers:** Dashboard, at-risk students, performance prediction, student reports (only their assigned mentees), tasks, and SEGA emergency handling.
- **Admins:** Dashboard, student progress, mentor–mentee assignment, university resources (suggested content), trends, dropout prediction view, SEGA command center, and settings.

Roles are **Student**, **Teacher**, and **Admin**. Login and data visibility depend on the role stored in the database.

---

## 2. Technology Stack

| Layer      | Technology |
|-----------|------------|
| **Frontend** | React 18, Vite, React Router, Tailwind CSS, Lucide React, Recharts, Framer Motion, jsPDF |
| **Backend**  | Python, FastAPI, multiple services (see below) |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **Spam / Mail** | Gmail IMAP (backend), stored in Supabase `emails` table |
| **Emergency (SEGA)** | Separate FastAPI server, in-memory storage (can be replaced with DB later) |

---

## 3. Frontend – How It Works

- **Single Page Application (SPA):** React app with client-side routing.
- **Entry:** User visits the app → redirected to `/login` if not logged in.
- **Auth:** Login/Signup and **Google OAuth** via Supabase Auth. After login, the app reads the user’s **role** from the `profiles` table and redirects to:
  - **Student** → `/student` (dashboard)
  - **Teacher** → `/teacher`
  - **Admin** → `/admin`
- **Routing:** Each URL is protected by `ProtectedRoute`: it checks that the user is logged in and has the required role; otherwise redirect to login.
- **Data:** Most data is **fetched from Supabase** in the browser using the Supabase JavaScript client (`@supabase/supabase-js`). The frontend uses:
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` (from `.env`) to create the Supabase client.
  - Queries like `supabase.from("profiles").select(...)`, `supabase.from("career_predictions").select(...)`, etc.
- **Career prediction:** The frontend also calls the **Career backend API** (port 8000) to get recommendations; it sends the user’s Supabase `user.id` in the `X-User-Id` header so the backend can save the prediction to Supabase.
- **Spam detection:** The frontend calls the **Spam backend API** (port 5000) to get already-classified emails (stored in Supabase `emails` by the backend).
- **SEGA (emergency):** The frontend talks to the **SEGA backend** (port 8003) to report and list incidents (in-memory on the server, not Supabase).

So: **frontend** = React UI + Supabase (auth + most data) + a few backend APIs (career, spam, SEGA).

---

## 4. Backend – How It Works

The backend is **multi-service**: one main process starts several **separate APIs** (each in its own process).

| Service | Port | Purpose |
|--------|------|--------|
| **Career Recommendation API** | 8000 | ML-based career prediction (branch-specific models), saves to Supabase |
| **Spam Detection API** | 5000 | Fetches Gmail via IMAP, classifies emails (important/faculty/events/spam/regular), stores in Supabase `emails`, moves spam to Gmail Trash |
| **Workload API** | 8001 | Workload-related (if used) |
| **SEGA Emergency API** | 8003 | Receives emergency reports, lists/dispatches/resolves incidents (in-memory) |
| **Auth & User API** | 8004 | Optional: JWT verification, GET/PATCH `/users/me` for profile (uses Supabase) |

- **Career API** uses `supabase_client` (Python) to insert into `career_predictions` (when `X-User-Id` is sent).
- **Spam API** uses Supabase to store rows in `emails` (and reads them for `/api/check-emails`).
- **Auth API** uses Supabase to read/update `profiles`.

So: **backend** = several small FastAPI apps; **Supabase** is used for storing career predictions, emails, and (via Auth API) profile data.

---

## 5. Supabase – Fetching and Storing Data

### 5.1 Authentication

- **Supabase Auth** handles:
  - Email/password signup and login
  - Google OAuth (redirect to `/auth/callback`, then app reads session and redirects by role)
- On signup, a trigger creates a row in **`profiles`** with the user’s id, email, full_name, and role (from metadata or default `student`).

### 5.2 Main Tables (in order of migrations)

1. **profiles** (from `supabase_schema.sql`)  
   - One row per user. Columns: id, email, role, full_name, avatar_url, phone, department, year, bio, cgpa, interests, onboarding_completed, etc.  
   - **Who uses it:** Frontend and Auth API read/update profiles; teachers/admins see profiles according to RLS (e.g. teachers only see their mentees after mentor–mentee migration).

2. **career_predictions**  
   - Stores each career prediction: user_id, branch, inputs (year, skills, aptitude, etc.), top_career, top_match_score, recommendations (JSON).  
   - **Storing:** Career backend writes here when the frontend calls `/predict` with `X-User-Id`.  
   - **Fetching:** Frontend reads from `career_predictions` (e.g. for dashboard and career path) for the logged-in user.

3. **user_settings**  
   - Per-user settings (theme, notifications, etc.). Frontend reads/updates via Supabase.

4. **career_progress_items** (from onboarding + career tracking migrations)  
   - Tracks resources (videos, notes, links) and progress (e.g. seconds_watched, pages_read, completed).  
   - Has a **source** (student / teacher / admin / system).  
   - **Storing:** Frontend (student) inserts when adding “my resource” or adding suggested/university resources; admin/teacher can insert for students (admin suggests per student; teacher only for mentees).  
   - **Fetching:** Students see their own; teachers see only non-student items for their mentees; admins see all (RLS).

5. **university_resources**  
   - Catalog of admin-suggested resources (videos, links, documents, notes) by career path.  
   - **Storing:** Admin only (from Admin University Resources page).  
   - **Fetching:** Students and backend read; students show “Suggested by University” and can add to their list (then stored in `career_progress_items` with source admin).

6. **mentor_mentee**  
   - Pairs (teacher_id, student_id).  
   - **Storing:** Admin only (Admin Mentor–Mentee page).  
   - **Fetching:** Used in RLS so teachers only see their mentees in `profiles` and in career progress/tasks.

7. **teacher_tasks**  
   - Tasks assigned by teacher to student (teacher_id, student_id, title, due_date, completed).  
   - **Storing:** Teachers insert (only for their mentees, enforced by RLS).  
   - **Fetching:** Students see their tasks; teachers see their own tasks.

8. **emails** (from `supabase_migration_emails_spam.sql`)  
   - Stored mailbox: from_email, from_name, subject, body, category (important/faculty/events/spam/regular), received_at.  
   - **Storing:** Spam backend writes here when it classifies emails from Gmail.  
   - **Fetching:** Spam backend returns categorized lists to the frontend (e.g. Spam tab = emails with category `spam`).

### 5.3 Row Level Security (RLS)

- **profiles:** Users read/update own row; teachers see only mentee profiles; admins see all (using a helper like `current_user_role()` to avoid recursion).
- **career_predictions:** Users read/insert own.
- **career_progress_items:** Students own rows; teachers see only where source ≠ student and user is their mentee; admins see all.
- **teacher_tasks:** Students see own; teachers see/manage own tasks; teachers can insert only for mentees; admins see all (where applicable).
- **mentor_mentee:** Teachers read own rows; admins read/insert/delete.
- **university_resources:** Authenticated users read; only admins insert/update/delete.
- **emails:** Backend uses anon key; policies allow read/insert for the table so the spam service can write and the API can read.

So: **Supabase** is used for **auth**, **user and role data**, **career predictions**, **career progress and university resources**, **mentor–mentee**, **teacher tasks**, and **stored emails**. Data is **fetched** by the frontend (Supabase client) and by the backend (Python Supabase client); **storing** is done by both (e.g. frontend for progress items, backend for predictions and emails).

---

## 6. Features by Role

### 6.1 Student

| Feature | Description |
|--------|-------------|
| **Dashboard** | CGPA, career match, career trajectory (from last prediction), tasks from teacher, risk widget, peer group, export report. |
| **Career Prediction** | Form: branch, year, skills, aptitude (quiz), communication, risk tolerance, preferences. Calls backend `/predict` (8000), gets top 3 careers; saves to Supabase (with X-User-Id). |
| **Career Path & Tracking** | Sidebar list of videos/notes/links; click to open. Add “Suggested by University”, “Suggested for your path”, and “My resource”. Track progress (watch %, pages read). Progress visible to university/mentor; “my” resources only to you and admin. |
| **Risk Prediction** | UI widget showing risk level (Low/Medium/High) and short explanation (no separate backend model; can be wired to CGPA later). |
| **Courses** | Course-related page. |
| **Peer Groups** | Peer group info. |
| **Spam Detection** | Mailbox tabs: Important, Faculty, Events, Inbox, Spam (in bin). Data from backend (Supabase `emails`). Spam that was moved to Gmail bin is listed in the Spam tab. |
| **SEGA** | Report emergency (category, type, explanation, photo, voice). Sends to SEGA API (8003). |
| **Settings** | Profile, theme, notifications (e.g. spam alerts). |

### 6.2 Teacher

| Feature | Description |
|--------|-------------|
| **Dashboard** | Teacher dashboard. |
| **Student Reports** | List of **assigned mentees only** (from mentor_mentee). CGPA, interests, career progress (suggested items completed). Add task for a mentee. |
| **At-Risk Students** | At-risk view. |
| **Performance Prediction** | Performance prediction view. |
| **SEGA** | View incidents, suggest actions, notify parent; can report own emergency (to admin). |
| **Settings** | Profile and preferences. |

### 6.3 Admin

| Feature | Description |
|--------|-------------|
| **Dashboard** | Admin dashboard. |
| **Student Progress** | All students: CGPA, interests, career progress. **Suggest resource** for a student (videos/links/notes) → appears as “Suggested by University” for that student. |
| **Mentor–Mentee** | Assign students to teachers. Only assigned students appear in that teacher’s Student Reports. |
| **University Resources** | Add/edit/delete catalog of resources (videos, links, documents, notes) by career path; students see them as “Suggested by University”. |
| **University Trends** | Trends view. |
| **Dropout Prediction** | Table of students with risk (High/Medium/Low/Critical). Currently **demo/static data** (no backend model). |
| **SEGA** | View all incidents, dispatch teams, ban student, resolve. |
| **Settings** | Profile and preferences. |

---

## 7. Applications / Modules (Summary)

| Module | Purpose |
|--------|--------|
| **Auth** | Login, signup, Google OAuth, role-based redirect, Supabase Auth + profiles. |
| **Career Prediction** | Branch-specific ML models (CSE, CIVIL, ECE, MECH), backend returns top 3 careers and saves to Supabase. |
| **Career Path & Tracking** | Curriculum-style UI; suggested + personal resources; progress tracking; visibility by role (mentor sees only suggested progress). |
| **Mentor–Mentee** | Admin assigns students to teachers; RLS restricts teacher views to mentees. |
| **University Resources** | Admin catalog; students add to their list; stored in career_progress_items with source admin. |
| **Spam Detection** | Backend fetches Gmail, classifies (weighted scoring), stores in Supabase, moves spam to bin; frontend shows all categories including Spam (in bin). |
| **SEGA** | Emergency report (student/teacher) and admin/teacher handling (in-memory backend). |
| **Teacher Tasks** | Tasks from teacher to (mentee) student; stored in Supabase; RLS limits teachers to mentees. |
| **Risk / Dropout** | Risk widget on dashboard; Dropout Prediction page uses static/demo data (no live ML model in codebase). |

---

## 8. Prediction Models and Outcomes

### 8.1 Career Recommendation (Real ML)

- **Where:** Backend `app.py` (Career API, port 8000).
- **Models:** **Pre-trained scikit-learn (joblib) models**, one per branch:
  - `cse_career_model_v1.1.pkl` (CSE)
  - `civil_career_model_v1.0.pkl` (CIVIL)
  - `ece_career_model_v1.0.pkl` (ECE)
  - `mech_career_model_v1.0.pkl` (MECH)
- **Input (from frontend):** Branch, Current_Year, Programming_Languages, Technical_Skills, Tools_Frameworks, Skill_Proficiency, Career_Preference, Research_Or_Industry, Aptitude_Score, Communication_Skill, Risk_Tolerance.
- **How it runs:** Backend loads the model for the given branch, builds a dataframe with the expected feature names (using a preprocessor if present), calls `model.predict_proba(df)`, then ranks careers by probability and returns **top 3** with **matching_score** (normalized percentage).
- **Outcome:** Top career + up to 3 recommendations with scores; saved to **Supabase `career_predictions`** when `X-User-Id` is provided. Frontend shows this on dashboard and career path (e.g. “Your path: Backend Engineer”).

(Note: The `.pkl` files are not in the repo; they must be placed in the Backend folder for the Career API to run.)

### 8.2 Spam Detection (Rule-Based Scoring)

- **Where:** Backend `spam_detection.py`.
- **Model:** Not ML. **Weighted rule-based scoring:** strong phrases (+2), weak phrases (+1), many links / ALL CAPS subject (+1). Trusted domains (e.g. .ac.in, .edu) get a score reduction. Threshold (e.g. 3) → mark as spam.
- **Outcome:** Each email is classified as important / faculty / events / spam / regular; spam is stored in `emails` and moved to Gmail Trash; all categories are shown in the Mailbox (Spam tab = “in bin”).

### 8.3 Risk Prediction (Dashboard)

- **Where:** Frontend component `RiskPrediction.jsx` (used on student dashboard).
- **Model:** No backend call. Displays a **risk level** (Low/Medium/High) and confidence with short explanations. Can be connected later to CGPA or another backend.

### 8.4 Dropout Prediction (Admin)

- **Where:** Frontend `DropoutPrediction.jsx`.
- **Model:** **No ML in codebase.** Table and stats use **static/demo data** (e.g. fixed list of students with risk levels). Can be replaced later by a real dropout model and API.

---

## 9. Outcomes of Predictions (Summary for Teacher)

| Prediction | Outcome |
|-----------|--------|
| **Career** | Top 1–3 career roles with **matching score (%)**; stored per user in Supabase; drives “Career Path” and dashboard “Active Path”. |
| **Spam** | Each email gets a **category** (important/faculty/events/spam/regular); spam is **moved to Gmail Trash** and **listed in the Spam (in bin) tab** on the website. |
| **Risk (dashboard)** | **Visual risk level** and explanation (no stored prediction in DB in current code). |
| **Dropout (admin)** | **Demo table** of risk levels; no live model yet. |

---

## 10. How to Run the Project

1. **Environment**
   - **Frontend:** `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`.
   - **Backend:** `.env` with `SUPABASE_URL`, `SUPABASE_KEY` (and optional `SUPABASE_JWT_SECRET` for Auth API). Spam backend may need Gmail IMAP credentials.

2. **Supabase**
   - Run migrations in order: `supabase_schema.sql` → `supabase_migration_onboarding_progress.sql` → `supabase_fix_profiles_rls_recursion.sql` → `supabase_migration_career_tracking.sql` → `supabase_migration_career_v2.sql` → `supabase_migration_admin_suggest_student.sql` → `supabase_migration_mentor_mentee.sql` → `supabase_migration_emails_spam.sql`.
   - In Supabase Dashboard: enable Email and Google auth; set Site URL and Redirect URLs (e.g. `http://localhost:5173/auth/callback`).

3. **Backend**
   - From `Backend` folder: `python main.py` (starts Career 8000, Spam 5000, Workload 8001, SEGA 8003, Auth 8004). Place `.pkl` files for Career API if needed.

4. **Frontend**
   - From `Frontend` folder: `npm install` then `npm run dev` (e.g. http://localhost:5173).

5. **Roles**
   - To test teacher/admin: in Supabase Table Editor, set `profiles.role` to `teacher` or `admin` for a user.

---

## 11. One-Paragraph Summary for Teacher

SUIS is a **Smart University Intelligence System** with a **React (Vite)** frontend and a **multi-service Python (FastAPI)** backend. **Supabase** handles authentication (email + Google) and stores **profiles** (with roles), **career_predictions**, **career_progress_items**, **university_resources**, **mentor_mentee**, **teacher_tasks**, and **emails** (for spam). The frontend fetches and displays this data by role; teachers see only their **mentees**; admins manage **mentor–mentee** and **university resources**. The only **real ML prediction** is **career recommendation**: branch-specific **scikit-learn (joblib)** models return top 3 careers and matching scores, which are saved to Supabase and shown on the dashboard and career path. **Spam detection** is **rule-based scoring** (no ML); classified emails are stored in Supabase and spam is moved to Gmail bin and shown in the “Spam (in bin)” tab. **SEGA** is an emergency reporting and handling module (separate API, in-memory). **Risk** and **Dropout** in the UI are either static/demo or placeholders for future models.
