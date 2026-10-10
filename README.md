# Job Recruitment Platform (MERN)

Full-stack job portal. Employers post jobs and review applicants; candidates search jobs and apply.

**Stack:** MongoDB, Express, React (Vite), Node.js, JWT auth, bcrypt, Claude API (Anthropic) for the AI features.

## Features
- Browse companies and see their open jobs
- Register / login as **candidate** or **employer** (JWT, role-based access)
- Job search by keyword, location and job type
- Employers: post/delete jobs, view applicants, set status (applied / shortlisted / rejected)
- Candidates: apply with cover letter + resume link, track application status

## AI features (employers)
1. **Draft with AI** - an employer types rough notes and the platform turns them into a structured, inclusive job description (About the role, Responsibilities, Requirements, Nice to have). The employer edits it before publishing.
2. **AI applicant summary** - for each applicant, a short summary, up to 3 strengths, up to 3 gaps and a 1-10 fit score based on the cover letter and the job description. The result is saved on the application so it is not paid for twice, and can be refreshed.

**How it is built**
- `server/services/ai.js` calls the Anthropic Messages API directly with `fetch` (30 s timeout, clear error codes) and includes JSON parsing, output validation and a per-user rate limit.
- `server/routes/ai.js` exposes `POST /api/ai/job-description` and `POST /api/ai/applications/:id/review`, both employer-only; the review route also checks that the employer owns the job.
- The prompts treat job and applicant text as untrusted data (prompt-injection defence), and the model output is validated and clamped before it is stored or returned.
- Unit tests for the service run with `npm test` in `server/` (mocked API, no key needed).

**Responsible AI choices**
- Advisory only: the AI never changes an application's status; a person decides.
- The prompt tells the model to ignore protected characteristics and the applicant's name, and to say when information is missing instead of guessing.
- Only the cover letter is analysed (the resume link is not fetched), and the UI says so.
- Candidate text is sent to a third-party AI provider, so a real deployment would need a privacy notice and a lawful basis under UK GDPR.

**Setup:** add `ANTHROPIC_API_KEY` (and optionally `AI_MODEL`) to `server/.env`. Without a key the rest of the app works and the AI buttons return a clear "not configured" message.

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
| POST | /api/ai/job-description | employer |
| POST | /api/ai/applications/:id/review | job owner |
