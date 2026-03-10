# SUIS – Authentication & Frontend–Backend Integration  
## How to explain to your teacher (with code references)

---

## Part 1: How we integrated authentication

We use **Supabase Auth** for identity and a **custom `profiles` table** in the database for **roles** (student / teacher / admin). The frontend talks to Supabase only for auth and profile; it does not implement passwords or tokens itself.

---

### 1.1 What Supabase does (server-side, managed by Supabase)

- **Stores users:** Email/password and OAuth users live in Supabase’s `auth.users` table (we don’t see this directly).
- **Verifies credentials:** When the user signs in (email/password or Google), Supabase checks the credentials and creates a **session**.
- **Session / JWT:** Supabase returns an **access token (JWT)** and refresh token. The **Supabase client in the frontend** stores this (e.g. in localStorage) and sends it automatically on every request to Supabase (so we don’t manually attach the token to Supabase calls).
- **OAuth redirect:** For “Continue with Google”, Supabase redirects the user to Google, then back to our **redirect URL** with the session in the URL hash. Our app must land on that URL so the client can read the hash and restore the session.

So: **Supabase handles user storage, password/OAuth verification, and issuing the session/JWT.** Our code only calls Supabase’s APIs and uses the session.

---

### 1.2 What our code does (frontend)

**1. Supabase client (single place we talk to Supabase):**

```text
File: Frontend/src/lib/supabase.js
```

- We create **one** Supabase client with project URL and anon key from env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`).
- Every auth or database call from the frontend uses this client (e.g. `supabase.auth.*`, `supabase.from("profiles")`).

**2. Login / Signup (email + password):**

```text
File: Frontend/src/pages/auth/AuthPage.jsx
```

- **Sign up:** We call `supabase.auth.signUp({ email, password, options: { data: { role } } })`. Supabase creates the user and (via trigger below) a row in `profiles`. We then upsert `profiles` with role and save role in `localStorage`, then redirect to `/${role}`.
- **Sign in:** We call `supabase.auth.signInWithPassword({ email, password })`. Supabase validates and returns a session. We then call `ensureProfileAndRole(user)` which:
  - **Fetches role from the database:** `supabase.from("profiles").select("role").eq("id", user.id).single()`
  - If no profile exists, **upserts** one with `id`, `email`, `full_name`, `role`
  - Saves role in `localStorage` and redirects to `/${role}` (e.g. `/student`, `/teacher`, `/admin`).

So: **our code** triggers login/signup via Supabase Auth, then **reads/updates the `profiles` table** to get or set the role and to show the correct dashboard.

**3. Google OAuth:**

- We call `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback` } })`.
- User is sent to Google; after approval, Supabase redirects to **our** `/auth/callback` with the session in the URL hash.
- **Important:** We must **not** redirect to `/` or `/login` before reading that hash, or the session is lost.

**4. OAuth callback (restore session and set role):**

```text
File: Frontend/src/pages/auth/AuthCallback.jsx
```

- We stay on `/auth/callback` and call `supabase.auth.getSession()` (and/or rely on `onAuthStateChange`). Supabase **parses the hash**, restores the session, and stores it.
- We then **fetch role from the database:** `supabase.from("profiles").select("role").eq("id", session.user.id).single()`.
- If there is no profile row, we **upsert** one (id, email, full_name, role).
- We save role in `localStorage` and redirect to `/${userRole}` (e.g. `/student`).

So: **our code** handles the redirect URL, restores the session, and **syncs the role from the database** into the app (and localStorage).

**5. Protecting routes (who can see which page):**

```text
File: Frontend/src/routes/ProtectedRoute.jsx
```

- For every protected route (e.g. `/student`, `/teacher`, `/admin/...`), we wrap the page with `<ProtectedRoute role="student">` (or teacher/admin).
- Inside ProtectedRoute we:
  - Call `supabase.auth.getSession()` to get the **current user**.
  - If there is no session or no role in localStorage, we redirect to `/login`.
  - If the route requires a specific role (e.g. `role="admin"`), we read role from `localStorage` (which came from `profiles`) and redirect to `/${storedRole}` if the user’s role is not allowed for this route.

So: **Authentication** (is there a user?) is from **Supabase session**; **authorization** (is this user a student/teacher/admin?) is from our **database (`profiles.role`)** and cached in localStorage.

**6. Role and “is logged in” helper:**

```text
File: Frontend/src/utils/auth.js
```

- `getRole()` reads `localStorage.getItem("role")` (we set this after every successful login from `profiles.role`).
- `isAuthed()` returns true if we have a role stored (we use this together with session check in ProtectedRoute).
- On logout we call `supabase.auth.signOut()` and remove role from localStorage.

So: **Supabase** = identity and session; **database (`profiles`)** = role; **localStorage** = quick role access in the frontend without querying the DB on every navigation.

---

### 1.3 How the database helps (Supabase PostgreSQL)

**1. `profiles` table (our table):**

- Stores one row per user: `id` (same as `auth.users.id`), `email`, `full_name`, `role` (student | teacher | admin), and other fields (e.g. department, year, cgpa).
- **Role is stored here.** So when we do “Sign in” or “Google callback”, we **fetch** `profiles.role` to know where to redirect (e.g. `/student` or `/admin`) and to enforce access in ProtectedRoute.

**2. Auto-create profile on signup (database trigger):**

```text
File: supabase_schema.sql (around lines 36–56)
```

- Trigger: `on_auth_user_created` runs **after insert** on `auth.users`.
- It calls a function `handle_new_user()` that **inserts** a row into `public.profiles` with:
  - `id` = new user’s id
  - `email`, `full_name` from auth
  - `role` from `raw_user_meta_data` (e.g. from signup options) or default `'student'`
- So whenever Supabase creates a new user (email or OAuth), the database **automatically** creates a `profiles` row. Our frontend then only needs to **read** or **update** that row (e.g. set role for new Google users who don’t have metadata).

**3. Row Level Security (RLS) on `profiles`:**

- Users can **read and update only their own** profile row (`auth.uid() = id`).
- So the frontend can safely do `supabase.from("profiles").select(...).eq("id", user.id)` and `update` for the same user; other users’ rows are not visible/editable.

**Summary for teacher:**  
Authentication (who is the user?) is done by **Supabase Auth** (credentials, JWT, session). The **database** stores and supplies the **role** in `profiles` and **automatically creates** a profile for every new user via trigger. Our **frontend code** only calls Supabase Auth and then uses the `profiles` table to get/set role and to protect routes.

---

## Part 2: How the frontend and backend are connected

We have two kinds of “backend” from the frontend’s point of view:

1. **Supabase** – auth and database (profiles, career_predictions, etc.).
2. **Our own APIs** – FastAPI services (Career, Spam, SEGA, etc.) on different ports.

---

### 2.1 Frontend ↔ Supabase (database and auth)

- **No custom backend in the middle.** The React app uses the **Supabase JavaScript client** and talks **directly** to Supabase (HTTPS).
- **Auth:** `supabase.auth.signInWithPassword()`, `signInWithOAuth()`, `getSession()`, `getUser()`, `signOut()`.
- **Database:** `supabase.from("profiles").select(...)`, `supabase.from("career_predictions").insert(...)`, etc. Supabase uses the **current session’s JWT** automatically in the request, so RLS can use `auth.uid()`.

So: **Frontend → Supabase** is direct (client → Supabase cloud). The “database” that helps auth is **Supabase (PostgreSQL)** with the `profiles` table and trigger.

---

### 2.2 Frontend ↔ our backend (FastAPI)

Our backend does **not** replace Supabase for auth. The frontend still gets the **user id (and role)** from Supabase (session + profiles). When the frontend needs something only the backend can do (e.g. run the career model), it calls our API with **fetch** and can send the **user id** in a header so the backend can store results in Supabase on behalf of that user.

**Example – Career prediction (frontend calls backend, backend uses database):**

```text
File: Frontend/src/pages/student/CareerPrediction.jsx (around 320–345)
```

**Step 1 – Frontend gets current user from Supabase:**

```javascript
const { data: { user } } = await supabase.auth.getUser();
```

**Step 2 – Frontend calls our Python backend with fetch:**

```javascript
const headers = { "Content-Type": "application/json" };
if (user?.id) headers["X-User-Id"] = user.id;

const response = await fetch("http://127.0.0.1:8000/predict", {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});
```

- So: **frontend** gets **who is logged in** from **Supabase**; then sends that **user id** in the **`X-User-Id`** header to our backend.

**Step 3 – Backend (Python) uses that user id and writes to Supabase:**

```text
File: Backend/app.py
```

- Backend receives the JSON body (branch, skills, etc.) and the **optional** header `X-User-Id`.
- It runs the **ML model** (joblib) and gets recommendations.
- It then calls **Supabase from the backend** (using `supabase_client`) to **insert** into `career_predictions` with `user_id = request.headers.get("X-User-Id")`.
- So: **backend** does the prediction and **persists the outcome in the same database (Supabase)** using the user id the frontend sent.

**Step 4 – Frontend can also write to Supabase directly (same table):**

- In the same flow, the frontend might also do a **client-side** insert into `career_predictions` (e.g. as a fallback or duplicate write). That insert uses `supabase.from("career_predictions").insert({ user_id: user.id, ... })` so the **logged-in user’s id** (from Supabase Auth) is stored.

So: **Frontend** gets identity from **Supabase**; **frontend** calls **our backend** with **fetch** and passes **user id** in a header; **backend** uses that id to **save to Supabase**. The database (Supabase) is shared between frontend and backend.

---

### 2.3 Summary diagram (text)

```text
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (React app)                                             │
│                                                                  │
│  1. Login: supabase.auth.signInWithPassword() / OAuth            │
│     → Supabase Auth checks credentials, returns session (JWT)    │
│                                                                  │
│  2. Role: supabase.from("profiles").select("role").eq("id", id)  │
│     → Database returns role (student/teacher/admin)              │
│     → We store role in localStorage, redirect to /student etc.  │
│                                                                  │
│  3. Protected route: supabase.auth.getSession() + getRole()       │
│     → No session or no role → redirect to /login                  │
│     → Wrong role → redirect to /${storedRole}                   │
│                                                                  │
│  4. Data: supabase.from("career_predictions").select(...)        │
│     → Direct read from Supabase (RLS uses auth.uid())            │
│                                                                  │
│  5. Call our API: fetch("http://127.0.0.1:8000/predict", {      │
│       headers: { "X-User-Id": user.id }, body: JSON.stringify()  │
│     })                                                           │
│     → Backend runs ML, then writes to Supabase with that user_id │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ Supabase Auth + Supabase DB        │ HTTP (fetch) to our backend
         ▼                                    ▼
┌─────────────────────┐            ┌─────────────────────┐
│  SUPABASE           │            │  OUR BACKEND        │
│  - auth.users       │            │  - Career API :8000 │
│  - profiles (role)   │◄───────────│  - Spam API :5000   │
│  - career_predictions│  (backend │  - SEGA :8003       │
│  - ...              │   writes   │  - Auth API :8004   │
│                     │   here)    │                     │
└─────────────────────┘            └─────────────────────┘
```

---

## Part 3: Short answers you can give your teacher

**Q: “How did you integrate authentication?”**  
We integrated **Supabase Auth**: the frontend uses the Supabase client (`Frontend/src/lib/supabase.js`) to call `signInWithPassword` or `signInWithOAuth`. Supabase verifies credentials and returns a session (JWT). We don’t store passwords; Supabase does. After login we fetch the user’s **role** from our **`profiles`** table in Supabase and store it in localStorage so we can redirect to the right dashboard (e.g. `/student`) and protect routes in `ProtectedRoute.jsx`.

**Q: “Which part of Supabase does what?”**  
**Supabase Auth** handles user signup/signin (email and Google), stores users, and issues the JWT/session. Our **Supabase database** has a **`profiles`** table that stores **role** (student/teacher/admin) and other profile data. A **database trigger** on `auth.users` creates a `profiles` row for every new user so we always have a role. RLS on `profiles` ensures users can only read/update their own row.

**Q: “How does the database help with authentication?”**  
The database stores **who has which role** in `profiles`. After Supabase Auth confirms identity, we **fetch** `profiles.role` and use it to redirect (e.g. to `/admin`) and to decide who can access which route in `ProtectedRoute`. So: **Auth** = Supabase; **Authorization (role)** = our database table `profiles`.

**Q: “How does the frontend fetch from the backend?”**  
For **Supabase** (auth and most data), the frontend uses the **Supabase client** only (no fetch to our server). For **our backend** (e.g. career prediction), the frontend uses **`fetch()`** to call our API (e.g. `POST http://127.0.0.1:8000/predict`) and sends the **logged-in user’s id** in the **`X-User-Id`** header so the backend can save results to Supabase for that user. So: **frontend → Supabase** = Supabase client; **frontend → our backend** = `fetch()` with optional `X-User-Id`; **backend → Supabase** = Python Supabase client to read/write the same database.

You can point your teacher to the exact files above (AuthPage.jsx, AuthCallback.jsx, ProtectedRoute.jsx, supabase.js, app.py, supabase_schema.sql) and this document for the professional, code-level explanation.
