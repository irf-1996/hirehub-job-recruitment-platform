# Job Recruitment Platform (MERN)

Full-stack job portal. Employers post jobs and review applicants; candidates search jobs and apply.

**Stack:** MongoDB, Express, React (Vite), Node.js, JWT auth, bcrypt.

## Features
- Browse companies and see their open jobs
- Register / login as **candidate** or **employer** (JWT, role-based access)
- Job search by keyword, location and job type
- Employers: post/delete jobs, view applicants, set status (applied / shortlisted / rejected)
- Candidates: apply with cover letter + resume link, track application status

## Run locally
```bash
# 1. Backend
cd server
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/jobs?q=&location=&type= | public |
| GET | /api/jobs/:id | public |
| POST | /api/jobs | employer |
| GET | /api/jobs/mine/list | employer |
| DELETE | /api/jobs/:id | owner |
| POST | /api/applications/:jobId | candidate |
| GET | /api/applications/mine | candidate |
| GET | /api/applications/job/:jobId | job owner |
| PATCH | /api/applications/:id/status | job owner |
