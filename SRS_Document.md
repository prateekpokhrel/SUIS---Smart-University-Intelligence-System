# Software Requirements Specification (SRS)
## SUIS — Smart University Intelligence System

---

## Page 1: Table of Contents

- **1. Introduction**
  - 1.1 Purpose
  - 1.2 Product Scope
  - 1.3 Definitions, Acronyms, and Abbreviations
  - 1.4 Technologies to be used
  - 1.5 Overview

- **2. Overall Description**
  - 2.1 Product Perspective
  - 2.2 User Classes and Characteristics
  - 2.3 Operating Environment
  - 2.4 User Documentation
  - 2.5 Software Interfaces
  - 2.6 Hardware Interfaces

- **3. System Features & Requirements**
  - 3.1 Functional Requirements
    - 3.1.1 User & Profile Management
    - 3.1.2 Career Prediction & Recommendations
    - 3.1.3 University Resources & Career Progress
    - 3.1.4 Mentor–Mentee Management
    - 3.1.5 Admin Dashboard & Analytics
    - 3.1.6 Spam Detection (Email)
    - 3.1.7 SEGA Emergency System
    - 3.1.8 Reporting & Export
  - 3.2 Non-functional Requirements
    - 3.2.1 Performance
    - 3.2.2 Security
    - 3.2.3 Scalability
    - 3.2.4 Usability
    - 3.2.5 Reliability
    - 3.2.6 Availability

- **4. System Design**
  - 4.1 Architecture & UML Diagrams
    - 4.1.1 Use Case Diagrams
    - 4.1.2 Class Diagrams
    - 4.1.3 Sequence Diagrams
    - 4.1.4 Activity Diagrams
    - 4.1.5 Data Flow Diagrams
  - 4.2 Database Design
    - 4.2.1 Entity-Relationship (E-R) Diagram
    - 4.2.2 Schema Overview
    - 4.2.3 Data Dictionary

- **5. User Interface (GUI)**
  - 5.1 Role-Based Dashboard Views
  - 5.2 Career Prediction Interface
  - 5.3 Mentee & Teacher Interface
  - 5.4 Admin Panel Interface
  - 5.5 Teacher Dashboard Interface

- **6. API Endpoints & Integration**
  - 6.1 RESTful API Specification
  - 6.2 Authentication & Authorization

- **7. Future Scope**

- **8. Conclusion**

- **9. References & Appendices**

---

## 1. Introduction

### 1.1 Purpose

The purpose of this Software Requirements Specification (SRS) document is to define the functional and non-functional requirements for the **SUIS (Smart University Intelligence System)**. SUIS is an integrated platform that assists students in career discovery and progress tracking, provides teachers with mentee oversight and tasks, and gives administrators tools for mentor–mentee assignment, university-suggested resources, and emergency (SEGA) handling.

### 1.2 Product Scope

The SUIS system encompasses:

- **Authentication & Roles:** Supabase Auth (email/password, Google OAuth); roles Student, Teacher, Admin stored in `profiles`; role-based dashboards and route protection.
- **Career Prediction Module:** Branch-specific ML models (CSE, CIVIL, ECE, MECH) returning top career recommendations; results stored in Supabase and displayed on dashboard and Career Path.
- **Career Path & Tracking:** Students add resources (videos, notes, links) from “Suggested by University,” “Suggested for your path,” and “My resource”; track progress (watch %, pages read); teachers see only suggested progress for their assigned mentees; admins see all.
- **Mentor–Mentee Management:** Admin assigns students to teachers; teachers see only assigned mentees in Student Reports and can add tasks for them.
- **University Resources:** Admin catalog of suggested videos, links, documents, and notes (by career path); students add these to their list; admin can also suggest resources per student.
- **Spam Detection:** Backend fetches Gmail via IMAP, classifies emails (important, faculty, events, spam, regular) using weighted rule-based scoring; stores in Supabase; spam moved to Gmail Trash and displayed in Mailbox “Spam (in bin)” tab.
- **SEGA Emergency System:** Students and teachers report emergencies (category, type, photo, voice); admin/teacher view incidents, dispatch teams, resolve; separate API (in-memory storage).
- **Reporting & Export:** CSV/PDF export for performance and academic reports; dashboard progress summary.

The system is intended for universities and educational institutions seeking to enhance student career support, mentorship assignment, and campus emergency response.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| **SUIS** | Smart University Intelligence System |
| **ML** | Machine Learning |
| **API** | Application Programming Interface |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **PDF** | Portable Document Format |
| **CSV** | Comma-Separated Values |
| **UI** | User Interface |
| **UX** | User Experience |
| **SLA** | Service Level Agreement |
| **PII** | Personally Identifiable Information |
| **GDPR** | General Data Protection Regulation |
| **SRS** | Software Requirements Specification |
| **ER** | Entity-Relationship |
| **Use Case** | Specific user interaction scenario |
| **Mentee** | Student assigned to a teacher in mentor_mentee; teacher sees only mentees in reports |
| **Mentor** | Teacher with assigned mentees (no separate Mentor role) |

### 1.4 Technologies to be Used

**Frontend:**
- React 18.x
- Vite (build tool)
- React Router DOM (routing)
- Tailwind CSS (styling)
- Supabase JavaScript client (`@supabase/supabase-js`) for auth and database access
- Fetch API for calling backend services (Career, Spam, SEGA)
- Lucide React (icons), Recharts (charts), Framer Motion (animations), jsPDF (PDF export)

**Backend:**
- Python 3.8+
- FastAPI (multiple services: Career, Spam, Workload, SEGA, Auth)
- Supabase Python client for database writes (career_predictions, emails)
- Scikit-learn / joblib (branch-specific career ML models)
- Pandas (data preparation for ML)
- IMAP (Gmail) for spam detection; rule-based scoring (no ML for spam)

**Authentication & Database:**
- Supabase (PostgreSQL + Auth)
- Supabase Auth: email/password, Google OAuth; JWT session
- Row Level Security (RLS) for profiles, career_predictions, career_progress_items, teacher_tasks, university_resources, mentor_mentee, emails

**Deployment:**
- Frontend: static build (Vite); can be served via Nginx or CDN
- Backend: multiple uvicorn processes (ports 5000, 8000, 8001, 8003, 8004) or Docker
- Supabase: hosted (Dashboard, SQL Editor, Auth providers)

### 1.5 Overview

This document details the complete specification for SUIS, including functional and non-functional requirements, system design, database schema, user interfaces, and API endpoints. It serves as the authoritative reference for development, testing, and deployment.

---

## 2. Overall Description

### 2.1 Product Perspective

SUIS is a standalone, full-stack web application that integrates with Supabase (Auth + PostgreSQL), Gmail (IMAP for spam), and optional university systems. It functions as:

- **Student-facing portal:** For career prediction, career path tracking, mailbox (spam), SEGA, and settings.
- **Educator tool:** For monitoring student progress and managing classroom dynamics.
- **Administrative system:** For reporting, user management, and system configuration.

The system is independent but may integrate with:
- University databases (student records, course offerings)
- Gmail (IMAP for spam detection and mailbox)
- External authentication providers (LDAP, OAuth)

### 2.2 User Classes and Characteristics

| User Class | Role | Primary Tasks | Technical Proficiency |
|-----------|------|---------------|----------------------|
| **Student** | Learner | Career prediction, career path & tracking (videos/notes/links), view dashboard, spam mailbox, SEGA emergency report, courses, peer groups, settings | Medium |
| **Teacher** | Educator | View assigned mentees only (Student Reports), add tasks, at-risk/performance views, SEGA incident handling, settings | Medium to High |
| **Administrator** | System and content manager | Student progress, mentor–mentee assignment, university resources catalog, suggest resources per student, trends, dropout view, SEGA command, settings | High |

### 2.3 Operating Environment

- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server:** Linux (Ubuntu 20.04 LTS or similar) or Windows Server
- **Runtime:** Python 3.8+, Node.js 16+
- **Architecture:** Client-Server with RESTful APIs
- **Network:** HTTPS, TCP/IP
- **Scale:** 1,000 to 50,000+ concurrent users (scalable backend)

### 2.4 User Documentation

Documentation will be provided in the following forms:

- **In-app help:** Tooltips and contextual guidance within the UI.
- **User manual:** PDF guide for each role (Student, Teacher, Admin).
- **API documentation:** OpenAPI/Swagger specs for developers.
- **Video tutorials:** Screen-capture walkthroughs for key workflows.
- **FAQ & Knowledge Base:** Self-service troubleshooting articles.

### 2.5 Software Interfaces

| Interface | Description |
|-----------|-------------|
| **Database** | Supabase (PostgreSQL); frontend and backend use Supabase client; RLS enforces access by role |
| **Authentication** | Supabase Auth (email/password, Google OAuth); JWT session; role from `profiles` table |
| **Career API** | FastAPI on port 8000; POST /predict with JSON body; optional header X-User-Id; returns top 3 careers; writes to `career_predictions` |
| **Spam API** | FastAPI on port 5000; GET /api/check-emails returns stored emails by category from Supabase `emails`; backend fetches Gmail via IMAP and classifies |
| **SEGA API** | FastAPI on port 8003; POST /emergency/report, GET /emergency/all; in-memory incident store |
| **Auth API** | FastAPI on port 8004; GET/PATCH /users/me with JWT; reads/updates Supabase `profiles` |
| **ML Model Serving** | Joblib (.pkl) models per branch in Career API; predict_proba for ranking careers |

### 2.6 Hardware Interfaces

- **Client:** Standard keyboard, mouse, monitor
- **Server:** Commodity x86 servers; minimum 4 CPU cores, 8 GB RAM
- **Storage:** SSD for database, S3/object storage for file uploads
- **Network:** 1 Gbps network interface; redundant connections recommended for production

---

## 3. System Features & Requirements

### 3.1 Functional Requirements

#### 3.1.1 User & Profile Management

**FR1.1:** The system shall support role-based registration and login via **Supabase Auth** (email/password, Google OAuth) with roles **Student**, **Teacher**, and **Admin** stored in the `profiles` table.

**FR1.2:** Each user shall have a profile (linked to `auth.users`) with: full name, email, avatar URL, phone, department, year (students), bio; and optionally CGPA, interests, and onboarding completion.

**FR1.3:** Students shall complete onboarding (academic level, interests) to enable personalized career and resource suggestions.

**FR1.4:** Administrators can view and manage users (profiles) and assign mentor–mentee relationships; account creation/deactivation is via Supabase Auth where applicable.

**FR1.5:** Password reset and account recovery shall be provided by Supabase Auth (email-based).

**FR1.6:** Users shall be able to update their profile and preferences (including `user_settings`: theme, notifications, spam alerts) at any time.

---

#### 3.1.2 Career Prediction & Recommendations

**FR2.1:** The system shall accept a student's inputs (branch, year, programming languages, technical skills, tools/frameworks, skill proficiency, career preference, research vs industry, aptitude, communication, risk tolerance) and return a **ranked list of top 3 career recommendations** via the Career API (branch-specific ML models).

**FR2.2:** Each career recommendation shall include career title and match score; full recommendations payload is stored in `career_predictions` (Supabase) and displayed on the dashboard and Career Path.

**FR2.3:** The system shall provide a **Career Path** experience: students see “Suggested by University,” “Suggested for your path,” and “My resource” items; they can add videos, notes, links, and track progress (watch %, pages read).

**FR2.4:** ML models (joblib, per branch: CSE, CIVIL, ECE, MECH) shall be served by the Career API; model updates are operational (replace .pkl and restart).

**FR2.5:** Career prediction results shall be persisted in `career_predictions` for the user and displayed in the UI; feedback/rating is optional future enhancement.

---

#### 3.1.3 University Resources & Career Progress

**FR3.1:** The system shall maintain a **University Resources** catalog (`university_resources`): admin-added items by career path and type (video, link, document, notes) with title, URL, optional video embed and notes.

**FR3.2:** Students shall see suggested resources (from catalog and from “Suggested for your path”) and add them to **Career Progress** (`career_progress_items`); types include youtube, video, course, action, notes, link, document; source is student, teacher, admin, or system.

**FR3.3:** Progress items shall support: video watch progress (seconds_watched, video_duration_sec), document progress (pages_read, total_pages), and notes_content; display_order for ordering.

**FR3.4:** Teachers shall see only career progress items for their **assigned mentees** (via `mentor_mentee`); they can add progress items (tasks/resources) for mentees; admins can add suggestions for any student.

**FR3.5:** Students shall have a “My resource” view for items they added; visibility rules (RLS) enforce that teachers see only non-student-source items for their mentees, and admins see all.

---

#### 3.1.4 Mentor–Mentee Management

**FR4.1:** Administrators shall assign students to teachers via the **Mentees** (mentor–mentee) page; the relationship is stored in `mentor_mentee` (teacher_id, student_id).

**FR4.2:** Teachers shall have a **Student Reports** (mentee) view showing only **assigned mentees**; profile and career progress data are filtered by RLS using `mentor_mentee`.

**FR4.3:** Teachers shall be able to add **tasks** for their mentees via `teacher_tasks` (title, due_date, completed); tasks are visible only to the assigned teacher and relevant student/admin as per RLS.

**FR4.4:** Students shall see their assigned mentor in the context of suggested resources and tasks; no separate “Mentor” role—mentors are teachers with assigned mentees.

**FR4.5:** Export of mentee/student reports (CSV/PDF) shall be available where implemented (e.g., performance/academic reports).

---

#### 3.1.5 Admin Dashboard & Analytics

**FR5.1:** The Admin Panel shall provide: student progress overview, mentor–mentee assignment (Mentees page), university resources catalog management, and ability to suggest resources for individual students.

**FR5.2:** Administrators shall view and manage: user profiles (via Supabase), mentor–mentee pairs, university resources, and (where implemented) trends and dropout/at-risk views.

**FR5.3:** The system shall support export of reports (CSV/PDF) for performance and academic data where implemented.

**FR5.4:** Access control shall be enforced via RLS and role checks (admin, teacher, student); audit logging may be added as a future enhancement.

---

#### 3.1.6 Spam Detection (Email)

**FR6.1:** The system shall provide an **email spam detection** flow: backend fetches emails via **Gmail IMAP**, classifies each email (important, faculty, events, spam, regular) using rule-based weighted scoring, and stores results in the `emails` table (Supabase).

**FR6.2:** Classified emails shall be displayed in the **Mailbox** UI with tabs (e.g., Important, Faculty, Events, Spam, Regular); emails classified as spam shall be moved to Gmail Trash (“Spam (in bin)”).

**FR6.3:** Students (and optionally other roles) shall view their mailbox and spam bin; no separate content moderation queue for forums—spam applies to email only.

**FR6.4:** Email metadata (from_email, from_name, subject, body, category, received_at) shall be stored for display and filtering.

---

#### 3.1.7 SEGA Emergency System

**FR7.1:** Students and teachers shall be able to **report emergencies** (category, type, optional photo, voice) via the SEGA API (POST /emergency/report).

**FR7.2:** Admin and teachers shall view **incidents** (GET /emergency/all), dispatch teams, and mark incidents resolved; incident storage is in-memory in the SEGA service.

**FR7.3:** The frontend shall integrate with the SEGA API for reporting and viewing emergencies; authentication is via JWT where required.

---

#### 3.1.8 Reporting & Export

**FR8.1:** Where implemented, users shall be able to export their own or assigned students’ data (e.g., performance reports, academic summary) in CSV and PDF formats.

**FR8.2:** Export features shall use the existing utilities (e.g., exportCSV, exportPDF, exportFullAcademicPDF) and respect role-based visibility (teachers: mentees only).

**FR8.3:** Reports may include date range, student list, and metrics as supported by the current UI; export logging may be added for compliance.

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

**NFR1.1:** Career prediction API shall respond within **2 seconds** for 95th percentile of requests.

**NFR1.2:** Dashboard and listing pages shall load within **3 seconds** over 4G networks.

**NFR1.3:** Search and filtering operations shall return results within **1 second**.

**NFR1.4:** The system shall support **at least 1,000 concurrent users** with acceptable response times.

**NFR1.5:** Database queries shall be optimized with appropriate indexing; no query shall exceed 5 seconds.

---

#### 3.2.2 Security

**NFR2.1:** All data transmission shall use **HTTPS/TLS 1.2+**.

**NFR2.2:** Passwords shall be hashed per **Supabase Auth** (secure hashing); no plain-text storage.

**NFR2.3:** The system shall implement **Role-Based Access Control (RBAC)**:
- Students cannot view other students' profiles
- Teachers cannot modify admin settings
- Admins have full system access

**NFR2.4:** API endpoints shall require **JWT bearer token authentication**.

**NFR2.5:** Personally Identifiable Information (PII) shall be encrypted at rest.

**NFR2.6:** The system shall be **GDPR compliant**:
- Users can request data export
- Users can request account deletion
- Data retention policies enforced

**NFR2.7:** Regular security audits and penetration testing shall be performed.

**NFR2.8:** SQL injection, XSS, and CSRF attacks shall be prevented through parameterized queries and input validation.

---

#### 3.2.3 Scalability

**NFR3.1:** The system architecture shall support **horizontal scaling**:
- Stateless backend servers behind a load balancer
- Read replicas for database

**NFR3.2:** The backend shall be containerized with Docker and orchestrated via Kubernetes (optional).

**NFR3.3:** The system shall support **auto-scaling** based on traffic (CPU/memory thresholds).

**NFR3.4:** Database connections shall use connection pooling to manage resource utilization.

**NFR3.5:** Static assets (frontend) shall be served via CDN for global performance.

---

#### 3.2.4 Usability

**NFR4.1:** The UI shall follow **WCAG 2.1 Level AA** accessibility standards.

**NFR4.2:** All buttons, forms, and controls shall be **keyboard navigable**.

**NFR4.3:** Color contrast ratio shall meet **4.5:1 (normal text)** or **3:1 (large text)**.

**NFR4.4:** The system shall support **multiple languages** (at least English and one regional language).

**NFR4.5:** Mobile responsiveness: the system shall be fully functional on screens **320px and above**.

**NFR4.6:** User interface shall be intuitive with minimal training required.

---

#### 3.2.5 Reliability

**NFR5.1:** The system shall achieve **99.5% uptime SLA** (excluding planned maintenance).

**NFR5.2:** Critical data shall be **backed up daily** with off-site replication.

**NFR5.3:** Recovery Time Objective (RTO) shall be **less than 4 hours** for critical failures.

**NFR5.4:** Recovery Point Objective (RPO) shall be **less than 1 hour**.

**NFR5.5:** The system shall gracefully handle errors and display user-friendly messages.

---

#### 3.2.6 Availability

**NFR6.1:** The system shall be available **24/7** with planned maintenance windows communicated in advance.

**NFR6.2:** Health checks and monitoring shall detect failures within **5 minutes**.

**NFR6.3:** Automated failover mechanisms shall minimize downtime during outages.

---

## 4. System Design

### 4.1 Architecture & UML Diagrams

#### 4.1.1 Use Case Diagrams

**Primary Actors:** Student, Teacher, Administrator

**Use Cases:**

```
Student:
├── Register/Login (Supabase Auth)
├── View/Request Career Predictions (top 3, branch-specific)
├── Career Path: view Suggested by University, Suggested for path, My resource
├── Track progress (videos, notes, links); add own resources
├── Mailbox (Spam): view classified emails, Spam (in bin)
├── SEGA: report emergency
├── Courses, Peer Groups, Settings; export report (CSV/PDF) where implemented

Teacher:
├── Login
├── Student Reports: view assigned mentees only (mentor_mentee)
├── Add tasks for mentees; view their career progress (suggested items)
├── At-risk/performance for mentees; SEGA view; export reports; Settings

Administrator:
├── Login
├── Mentees: assign students to teachers (mentor_mentee)
├── University Resources: catalog (career path, type, title, URL); suggest per student
├── Student progress, trends, dropout view; SEGA command
├── Settings; export/analytics where implemented
```

---

#### 4.1.2 Class Diagrams

**Core Classes (aligned with Supabase schema):**

```
Class: Profile (maps to auth.users + public.profiles)
├── Attributes: id, email, role (student|teacher|admin), full_name, department, year, cgpa, interests, onboarding_completed
├── Methods: update_profile(); role used by RLS and current_user_role()

Class: CareerPrediction
├── Attributes: user_id, branch, inputs..., top_career, top_match_score, recommendations (JSONB)
├── Methods: persisted by Career API; read via Supabase

Class: CareerProgressItem
├── Attributes: user_id, type, source (student|teacher|admin|system), title, url, progress fields (seconds_watched, pages_read, notes_content)
├── Methods: CRUD via Supabase; RLS by role and mentor_mentee

Class: TeacherTask
├── Attributes: teacher_id, student_id, title, due_date, completed
├── Methods: teachers CRUD for own tasks; students read/update own

Class: UniversityResource
├── Attributes: career_path, type, title, url, video_embed_url, notes_content
├── Methods: admin CRUD via Supabase

Class: MentorMentee
├── Attributes: teacher_id, student_id, assigned_at
├── Methods: admin assign/unassign; RLS filters teacher views to mentees only

Class: Email (spam/mailbox)
├── Attributes: from_email, subject, body, category (important|faculty|events|spam|regular)
├── Methods: backend writes after IMAP + classification; frontend reads via Supabase/Spam API
```

---

#### 4.1.3 Sequence Diagrams

**Scenario 1: Career Prediction Request**

```
Student                 Frontend               Backend API             ML Model
  |                         |                       |                      |
  |--Request Career Pred---->|                       |                      |
  |                         |--POST /predict-------->|                      |
  |                         |                    [Load profile]             |
  |                         |                       |--Load model & predict-->|
  |                         |                       |<--Return prediction---|
  |                         |                    [Save to DB]              |
  |                         |<--Return Prediction---|                      |
  |--Display Roadmap------<-|                       |                      |
```

**Scenario 2: Admin assigns mentees to teacher**

```
Admin                   Frontend               Supabase
  |                         |                      |
  |--Open Mentees page----->|                      |
  |                         |--SELECT profiles---->| (teachers, students)
  |<--Display lists---------|<- (role filter) -----|
  |--Select teacher+students->|                    |
  |                         |--INSERT mentor_mentee->|
  |                         |                      | RLS
  |<--Assignment saved------|                      |
```

---

#### 4.1.4 Activity Diagrams

**Career Recommendation Process:**

```
[Start] 
   |
   v
[Student Submits Profile]
   |
   v
[Validate Input Data]
   |
   +--No--> [Display Error] --> [End]
   |
   Yes
   |
   v
[Load ML Model]
   |
   v
[Extract Features]
   |
   v
[Generate Predictions]
   |
   v
[Score & Rank Careers]
   |
   v
[Generate Roadmap]
   |
   v
[Save to Database]
   |
   v
[Return to User]
   |
   v
[End]
```

**Mentor–Mentee Assignment (Admin):**

```
[Start]
   |
   v
[Admin opens Mentees page]
   |
   v
[Select Teacher + Students]
   |
   v
[Insert into mentor_mentee]
   |
   v
[RLS: Teacher sees only these students in profiles / progress / tasks]
   |
   v
[End]
```

---

#### 4.1.5 Data Flow Diagrams (DFD)

**Level 0 (Context Diagram):**

```
[User] <--> [SUIS Frontend] <--> [Supabase (Auth + DB)]
                |
                +------------------> [Career API] --> [ML Model]
                +------------------> [Spam API] <--> [Gmail IMAP]
                +------------------> [SEGA API]
                +------------------> [Auth API] --> [Supabase]
```

**Level 1 (Main Processes):**

```
  [Users] --> [Supabase Auth] --> [profiles]
       |
       v
  [Career Path] --> [Supabase career_progress_items, university_resources]
  [Career API]  --> [ML models] --> [career_predictions]
  [Spam]        --> [Spam API / IMAP] --> [emails]
  [SEGA]        --> [SEGA API] (in-memory)
  [Mentees]     --> [Supabase mentor_mentee, teacher_tasks]
```

---

### 4.2 Database Design

#### 4.2.1 Entity-Relationship (E-R) Diagram

**Core Entities (Supabase):**

- **auth.users** (Supabase Auth) → **profiles** (1:1): id, email, role (student | teacher | admin), full_name, department, year, cgpa, interests, onboarding_completed.
- **profiles** → **user_settings** (1:1): theme, notifications, spam_alerts, etc.
- **profiles** → **career_predictions** (1:N): branch, inputs, top_career, top_match_score, recommendations (JSONB).
- **profiles** → **career_progress_items** (1:N): type (youtube, video, course, action, notes, link, document), source (student | teacher | admin | system), progress fields.
- **university_resources**: catalog by career_path and type; no direct user FK.
- **mentor_mentee** (teacher_id, student_id): N:N between teachers and students; RLS restricts teachers to assigned mentees.
- **teacher_tasks**: teacher_id, student_id, title, due_date, completed.
- **emails**: from_email, subject, body, category (important | faculty | events | spam | regular), received_at.

---

#### 4.2.2 Schema Overview

The database is **Supabase (PostgreSQL)**. Auth is handled by **auth.users**; application data lives in **public**. Apply migrations in order: `supabase_schema.sql` → `supabase_migration_onboarding_progress.sql` → `supabase_fix_profiles_rls_recursion.sql` → `supabase_migration_career_tracking.sql` → `supabase_migration_career_v2.sql` → `supabase_migration_admin_suggest_student.sql` → `supabase_migration_mentor_mentee.sql` → `supabase_migration_emails_spam.sql`.

```sql
-- 1) PROFILES (extends auth.users – one row per user)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT DEFAULT 'CSE',
  year TEXT DEFAULT '1st Year',
  bio TEXT,
  cgpa NUMERIC(4,2),
  interests TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) CAREER_PREDICTIONS (Career API writes here)
CREATE TABLE public.career_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  branch TEXT,
  current_year INT,
  programming_languages TEXT,
  technical_skills TEXT,
  tools_frameworks TEXT,
  skill_proficiency TEXT,
  career_preference TEXT,
  research_or_industry TEXT,
  aptitude_score INT,
  communication_skill INT,
  risk_tolerance INT,
  top_career TEXT,
  top_match_score NUMERIC,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) USER_SETTINGS (theme, notifications – 1:1 with user)
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  compact_mode BOOLEAN DEFAULT false,
  font_size TEXT DEFAULT 'medium',
  email_noti BOOLEAN DEFAULT true,
  push_noti BOOLEAN DEFAULT false,
  spam_alerts BOOLEAN DEFAULT true,
  important_alerts BOOLEAN DEFAULT true,
  hide_email BOOLEAN DEFAULT false,
  auto_logout TEXT DEFAULT '30m',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) CAREER_PROGRESS_ITEMS (videos, notes, links, courses – student + suggested)
CREATE TABLE public.career_progress_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('youtube', 'video', 'course', 'action', 'notes', 'link', 'document')),
  source TEXT DEFAULT 'student' CHECK (source IN ('student', 'teacher', 'admin', 'system')),
  title TEXT NOT NULL,
  url TEXT,
  video_embed_url TEXT,
  video_duration_sec INT,
  seconds_watched INT DEFAULT 0,
  total_pages INT,
  pages_read INT DEFAULT 0,
  notes_content TEXT,
  display_order INT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  added_by_teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5) TEACHER_TASKS (tasks from teacher to student)
CREATE TABLE public.teacher_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) UNIVERSITY_RESOURCES (admin catalog by career path)
CREATE TABLE public.university_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path TEXT,
  type TEXT,
  title TEXT NOT NULL,
  url TEXT,
  video_embed_url TEXT,
  video_duration_sec INT,
  notes_content TEXT,
  total_pages INT,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7) MENTOR_MENTEE (admin assigns students to teachers)
CREATE TABLE public.mentor_mentee (
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (teacher_id, student_id),
  CHECK (teacher_id != student_id)
);

-- 8) EMAILS (spam detection – classified mailbox)
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email TEXT,
  from_name TEXT,
  subject TEXT,
  body TEXT,
  category TEXT CHECK (category IN ('important', 'faculty', 'events', 'spam', 'regular')),
  received_at TIMESTAMPTZ
);
```

RLS is enabled on all tables above. A helper `current_user_role()` (SECURITY DEFINER) returns the current user's role from `profiles` to avoid recursion in policies. Teachers see only rows for their assigned mentees (profiles, career_progress_items, teacher_tasks) via RLS that joins `mentor_mentee`.

---

#### 4.2.3 Data Dictionary

| Column | Table | Type | Constraint | Description |
|--------|-------|------|-----------|-------------|
| id | profiles | UUID | PRIMARY KEY, FK auth.users | User profile; 1:1 with auth user |
| email | profiles | TEXT | - | User email (synced from Auth) |
| role | profiles | TEXT | CHECK student/teacher/admin | Application role |
| full_name | profiles | TEXT | - | Display name |
| department | profiles | TEXT | DEFAULT 'CSE' | Department (e.g. CSE, ECE) |
| year | profiles | TEXT | - | Academic year (e.g. 1st Year) |
| cgpa | profiles | NUMERIC(4,2) | - | Grade Point Average |
| interests | profiles | TEXT | - | Student interests (onboarding) |
| onboarding_completed | profiles | BOOLEAN | - | Onboarding done flag |
| user_id | career_predictions | UUID | FK auth.users | Owner of prediction |
| branch | career_predictions | TEXT | - | Branch (CSE, CIVIL, ECE, MECH) |
| top_career | career_predictions | TEXT | - | Top recommended career |
| top_match_score | career_predictions | NUMERIC | - | Match score for top career |
| recommendations | career_predictions | JSONB | - | Full recommendations payload |
| id | user_settings | UUID | PRIMARY KEY, FK auth.users | 1:1 with user |
| theme | user_settings | TEXT | - | light / dark |
| spam_alerts | user_settings | BOOLEAN | - | Spam alert preference |
| user_id | career_progress_items | UUID | NOT NULL, FK auth.users | Owner student |
| type | career_progress_items | TEXT | CHECK | youtube, video, course, action, notes, link, document |
| source | career_progress_items | TEXT | - | student, teacher, admin, system |
| seconds_watched | career_progress_items | INT | - | Video watch progress |
| pages_read | career_progress_items | INT | - | Document progress |
| teacher_id | teacher_tasks | UUID | NOT NULL, FK auth.users | Assigning teacher |
| student_id | teacher_tasks | UUID | NOT NULL, FK auth.users | Assigned student |
| teacher_id | mentor_mentee | UUID | PK, FK auth.users | Teacher in pair |
| student_id | mentor_mentee | UUID | PK, FK auth.users | Student in pair |
| category | emails | TEXT | CHECK | important, faculty, events, spam, regular |

---

## 5. User Interface (GUI)

### 5.1 Role-Based Dashboard Views

**Student Dashboard:**
- Welcome banner with first name
- Recent career recommendations (top career, match score) from `career_predictions`
- Career Path / progress (Suggested by University, Suggested for your path, My resource)
- Progress metrics (videos watched, notes, links completed)
- Quick actions: Career Prediction, Career Path, Courses, Peer Groups, Mailbox (Spam), SEGA, Settings

**Teacher Dashboard:**
- Student Reports limited to **assigned mentees** (mentor–mentee)
- At-risk student alerts and performance metrics for mentees
- Add tasks for mentees; view their career progress (suggested items only)
- SEGA emergency view; Settings

**Admin Dashboard:**
- Student progress and trends; dropout/at-risk views where implemented
- **Mentees** page: assign students to teachers (mentor_mentee)
- **University Resources** catalog: add/edit resources by career path and type
- Suggest resources for individual students (career_progress_items with source admin)
- SEGA command/view; Settings

---

### 5.2 Career Prediction Interface

**Input Form:**
- Branch (CSE, CIVIL, ECE, MECH), year, programming languages, technical skills, tools/frameworks, skill proficiency, career preference (research/industry), aptitude, communication, risk tolerance
- Submit button; loading state while calling Career API

**Results Display:**
- **Top 3** career recommendations (from branch-specific ML model)
- Each card: career title, match score; full list stored in `career_predictions` and shown on dashboard and Career Path
- Optional: roadmap or detailed view where implemented

---

### 5.3 Mentee & Teacher Interface

**Teacher – Student Reports (Mentees):**
- Lists only **assigned mentees** (from `mentor_mentee`); no separate “Mentor” role
- View mentee profiles (name, department, year, CGPA, interests)
- View mentees’ career progress (suggested items only; student-added items hidden from teacher per RLS)
- Add **tasks** for mentees (title, due date, completed)
- Add **career progress items** (suggestions) for mentees
- Export reports (CSV/PDF) where implemented

**Admin – Mentees Page:**
- Assign students to teachers: select teacher, select one or more students; stored in `mentor_mentee`
- View/edit assignments; no self-assign (teacher_id ≠ student_id)

---

### 5.4 Admin Panel Interface

**Users / Profiles:**
- View users (profiles); role, department, year; manage via Supabase Auth where applicable

**Mentees (Mentor–Mentee):**
- Assign students to teachers; table or list of pairs; add/remove assignments

**University Resources:**
- Catalog of suggested resources: career path, type (video, link, document, notes), title, URL, optional video embed and notes
- Add/edit/delete entries; used for “Suggested by University” and “Suggested for your path”
- Suggest resources for **individual students** (insert into `career_progress_items` with source admin)

**Analytics / Trends:**
- Student progress, trends, dropout/at-risk views where implemented
- Export reports (CSV/PDF) where implemented

---

### 5.5 Teacher Dashboard Interface

**Student Reports (Mentees only):**
- At-risk and performance metrics for **assigned mentees only**
- Add tasks; view career progress (suggested items)
- Export to CSV/PDF where implemented

**SEGA:**
- View and handle emergency incidents reported by students/teachers

**Settings:**
- Theme, notifications (aligned with `user_settings`)

---

## 6. API Endpoints & Integration

### 6.1 RESTful API Specification

**Authentication:** Supabase Auth (JWT). Frontend uses `@supabase/supabase-js` for sign-in, sign-up, password reset, and session; role is read from `profiles`. Backend services that need the current user accept `Authorization: Bearer <supabase_jwt>` or `X-User-Id` where applicable.

**Data access:** Most CRUD is via **Supabase client** from the frontend (profiles, user_settings, career_progress_items, teacher_tasks, university_resources, mentor_mentee, emails) with RLS enforcing visibility. Backend APIs below are used for ML, spam, SEGA, and profile proxy.

#### Career API (e.g. port 8000)

```
POST /predict
  Header: Authorization: Bearer <token> (optional); X-User-Id (optional)
  Body: {
    branch, current_year, programming_languages, technical_skills,
    tools_frameworks, skill_proficiency, career_preference, research_or_industry,
    aptitude_score, communication_skill, risk_tolerance
  }
  Response: {
    top_career, top_match_score, recommendations: [ { career, score }, ... ]
  }
  Side-effect: writes row to Supabase career_predictions (if user_id provided)
```

#### Spam / Mailbox API (e.g. port 5000)

```
GET /api/check-emails
  Response: { emails: [ { id, from_email, from_name, subject, body, category, received_at }, ... ] }
  Data source: Supabase emails table (backend fetches Gmail via IMAP, classifies, writes to Supabase)
```

#### SEGA Emergency API (e.g. port 8003)

```
POST /emergency/report
  Header: Authorization: Bearer <token>
  Body: { category, type, photo?, voice? }
  Response: { incident_id or success }

GET /emergency/all
  Header: Authorization: Bearer <token>
  Response: { incidents: [...] }
  Note: in-memory store in SEGA service
```

#### Auth / Profile API (e.g. port 8004)

```
GET /users/me
  Header: Authorization: Bearer <token>
  Response: { id, email, role, full_name, ... } (from Supabase profiles)

PATCH /users/me
  Header: Authorization: Bearer <token>
  Body: { full_name, phone, department, year, ... }
  Response: { updated profile }
```

#### Supabase (profiles, RLS, other tables)

- **profiles:** read/update via Supabase client; teachers and admins see profiles per RLS (teachers only for assigned mentees after mentor_mentee migration).
- **career_progress_items:** students insert/update own; teachers insert for mentees; admins insert for any student; visibility by role and mentor_mentee.
- **teacher_tasks:** teachers CRUD for their tasks; students read/update own (e.g. mark complete).
- **university_resources:** admin (or allowed role) CRUD via Supabase.
- **mentor_mentee:** admin (or allowed role) insert/delete pairs.
- **emails:** read/insert as per RLS (e.g. anon/authenticated for spam flow).

#### Reporting & Export

- Export is implemented in the frontend using utilities (e.g. exportCSV, exportPDF, exportFullAcademicPDF); no dedicated export API required for current features.

---

### 6.2 Authentication & Authorization

**Auth provider:** Supabase Auth. JWT is issued by Supabase (e.g. `aud: authenticated`, `sub: user_uuid`). Role is stored in `profiles.role` (student | teacher | admin) and read by the app and by RLS helper `current_user_role()`.

**RBAC (summary):**
- **Students:** Own profile, own career_predictions and career_progress_items, own teacher_tasks (read/update), mailbox (spam), SEGA report.
- **Teachers:** Own profile; **assigned mentees only** for profiles, career_progress_items, teacher_tasks (add tasks, view suggested progress); SEGA view.
- **Admins:** Full read of profiles, career_progress_items, teacher_tasks; manage mentor_mentee and university_resources; suggest progress for any student; SEGA.

---

## 7. Future Scope

1. **Mobile Application:** Native iOS/Android apps for on-the-go access.
2. **Advanced Analytics:** Predictive modeling for student dropout prevention.
3. **Gamification:** Badges, leaderboards, and achievement tracking.
4. **Integration with LMS:** Sync with Canvas, Blackboard, Moodle.
5. **Interview Preparation:** Mock interview module with AI feedback.
6. **Alumni Network:** Connect with graduates for career mentoring.
7. **Industry Partnerships:** Direct job/internship listings from employers.
8. **Blockchain Certificates:** Digital credentials for verified achievements.
9. **Multi-language Support:** Localization for non-English regions.
10. **API Marketplace:** Third-party developers can build extensions.

---

## 8. Conclusion

The SUIS (Smart University Intelligence System) is a platform that supports student success through career prediction (branch-specific ML), career path tracking (videos, notes, links), mentor–mentee assignment (teachers see only assigned students), university-suggested resources, email spam classification, and SEGA emergency reporting. Supabase provides authentication and the PostgreSQL database with RLS; separate FastAPI services handle career prediction, spam/mailbox, and SEGA. With role-based access and alignment to the implemented schema and APIs, the SRS reflects the current system and serves as the single reference for requirements and design.

---

## 9. References & Appendices

### 9.1 References

1. IEEE Std 830-1998: IEEE Guide to Software Requirements Specifications
2. SWEBOK v3: Guide to the Software Engineering Body of Knowledge
3. WCAG 2.1: Web Content Accessibility Guidelines (W3C)
4. NIST Cybersecurity Framework
5. GDPR Compliance Guide: https://gdpr.eu/
6. FastAPI Documentation: https://fastapi.tiangolo.com/
7. React Documentation: https://react.dev/
8. PostgreSQL Documentation: https://www.postgresql.org/docs/
9. Supabase Documentation: https://supabase.com/docs

### 9.2 Appendix A: Glossary

- **At-Risk Student:** Student with indicators of high dropout probability.
- **Career Path:** Suggested and self-added resources (videos, notes, links) with progress tracking; sources: university, suggested for path, my resource.
- **Mentee:** Student assigned to a teacher in `mentor_mentee`; teacher sees only mentees in Student Reports and progress.
- **RLS (Row Level Security):** Supabase/PostgreSQL feature that restricts rows visible to a user by role and mentor_mentee.
- **SEGA:** Emergency reporting and incident handling module (separate API).
- **SUIS:** Smart University Intelligence System.

### 9.3 Appendix B: Acceptance Criteria

**For Release 1.0:**
- [ ] All FR1–FR8 functional requirements implemented
- [ ] All NFR performance, security, scalability requirements met
- [ ] 95% unit test coverage for backend
- [ ] All API endpoints documented and tested
- [ ] Security audit completed with zero critical findings
- [ ] UI/UX reviewed and accessibility verified (WCAG AA)
- [ ] Database schema finalized and optimized
- [ ] Documentation complete (user manual, API docs, deployment guide)

### 9.4 Appendix C: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Development Team | Initial SRS draft |
| 1.1 | 2026-02-17 | Development Team | Aligned SRS with codebase: Supabase schema (profiles, career_predictions, user_settings, career_progress_items, teacher_tasks, university_resources, mentor_mentee, emails); functional requirements (career path, mentor–mentee, spam email, SEGA); APIs (Career, Spam, SEGA, Auth); UI and RBAC; removed scholarship/university discovery, load balancing, separate Mentor role |

---

**Document Classification:** Internal Use  
**Last Updated:** 2026-02-17  
**Next Review Date:** 2026-03-26

