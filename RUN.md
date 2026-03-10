# How to Run SUIS (Frontend + Backend)

## 1. Supabase setup (one-time)

1. In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor** → **New query**, paste and run the contents of **`supabase_schema.sql`** (in the project root).
2. In **Authentication → Providers**, enable **Email** and **Google** if you want them.
3. In **Authentication → URL Configuration**, set **Site URL** to `http://localhost:5173` (or your frontend URL). Add `http://localhost:5173/**` to **Redirect URLs** for OAuth.
4. In **Settings → API** copy:
   - **Project URL** → use as `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_ANON_KEY` (frontend)
   - **service_role** key → use as `SUPABASE_KEY` (backend)
   - **JWT Secret** → use as `SUPABASE_JWT_SECRET` (backend Auth API)

---

## 2. Backend

```bash
cd Backend
```

Create a `.env` file (copy from below):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret-from-dashboard
```

Install dependencies and run:

```bash
pip install -r requirements.txt
python main.py
```

You should see:

- Career API    → http://127.0.0.1:8000  
- Spam API      → http://127.0.0.1:5000  
- Workload API  → http://127.0.0.1:8001  
- SEGA API      → http://127.0.0.1:8003  
- Auth API      → http://127.0.0.1:8004  

Stop with **Ctrl+C**.

---

## 3. Frontend

```bash
cd Frontend
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Install and run:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in the browser. You can sign up / log in with email or Google; profile and role are stored in Supabase.

---

## Summary

| What        | Command / URL                          |
|------------|----------------------------------------|
| Backend    | `cd Backend && pip install -r requirements.txt && python main.py` |
| Frontend   | `cd Frontend && npm install && npm run dev` |
| App        | http://localhost:5173                  |
| Auth API   | http://127.0.0.1:8004/docs             |

Run the backend first, then the frontend. Use the same Supabase project for both.
