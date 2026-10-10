import { useEffect, useState } from "react";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

function Candidate() {
  const [apps, setApps] = useState([]);
  useEffect(() => { api.get("/applications/mine").then((r) => setApps(r.data)); }, []);
  return (
    <>
      <h2>My applications</h2>
      {apps.length === 0 && <p className="muted">No applications yet.</p>}
      {apps.map((a) => (
        <div className="card" key={a._id}>
          <h3>{a.job?.title || "Job removed"}</h3>
          <p>{a.job?.company} · {a.job?.location}</p>
          <span className={`tag ${a.status}`}>{a.status}</span>
        </div>
      ))}
    </>
  );
}

function Employer() {
  const { user } = useAuth();
  const empty = { title: "", company: user.company || "", location: "", type: "Full-time", salary: "", description: "" };
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [err, setErr] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api.get("/jobs/mine/list").then((r) => setJobs(r.data));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    try { await api.post("/jobs", form); setForm(empty); setErr(""); load(); }
    catch (e2) { setErr(errMsg(e2)); }
  };
  const draftWithAi = async () => {
    setAiBusy(true); setErr("");
    try {
      const { data } = await api.post("/ai/job-description", { ...form, notes: form.description });
      setForm((f) => ({ ...f, description: data.description }));
    } catch (e2) { setErr(errMsg(e2)); }
    setAiBusy(false);
  };
  const reviewApplicant = async (id, refresh = false) => {
    setReviewBusy(id);
    try {
      const { data } = await api.post(`/ai/applications/${id}/review${refresh ? "?refresh=1" : ""}`);
      setApplicants((list) => list.map((a) => (a._id === id ? { ...a, aiReview: data } : a)));
    } catch (e2) { alert(errMsg(e2)); }
    setReviewBusy(null);
  };
  const remove = async (id) => { if (confirm("Delete this job?")) { await api.delete(`/jobs/${id}`); setOpen(null); load(); } };
  const view = async (id) => {
    if (open === id) return setOpen(null);
    setApplicants((await api.get(`/applications/job/${id}`)).data);
    setOpen(id);
  };
  const setStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    setApplicants((list) => list.map((a) => (a._id === appId ? { ...a, status } : a)));
  };

  return (
    <>
      <h2>Post a job</h2>
      <form onSubmit={post} className="card col">
        <input placeholder="Job title" value={form.title} onChange={set("title")} required />
        <input placeholder="Company" value={form.company} onChange={set("company")} required />
        <input placeholder="Location" value={form.location} onChange={set("location")} required />
        <div className="row">
          <select value={form.type} onChange={set("type")}>
            {["Full-time", "Part-time", "Contract", "Remote"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input placeholder="Salary (optional)" value={form.salary} onChange={set("salary")} />
        </div>
        <textarea rows="5" placeholder="Description (or type rough notes and click Draft with AI)" value={form.description} onChange={set("description")} required />
        <button type="button" className="btn small" onClick={draftWithAi} disabled={aiBusy || !form.title || !form.description.trim()}>
          {aiBusy ? "Drafting..." : "Draft with AI"}
        </button>
        <p className="muted">AI drafts from your notes. Always review and edit before publishing.</p>
        {err && <p className="error">{err}</p>}
        <button className="btn">Publish job</button>
      </form>

      <h2>My jobs</h2>
      {jobs.map((j) => (
        <div className="card" key={j._id}>
          <h3>{j.title}</h3>
          <p>{j.company} · {j.location}</p>
          <button className="btn small" onClick={() => view(j._id)}>{open === j._id ? "Hide" : "View"} applicants</button>{" "}
          <button className="btn small danger" onClick={() => remove(j._id)}>Delete</button>
          {open === j._id && (applicants.length === 0 ? <p className="muted">No applicants yet.</p> : applicants.map((a) => (
            <div key={a._id} className="applicant">
              <strong>{a.candidate?.name}</strong> ({a.candidate?.email})
              {a.resumeUrl && <> · <a href={a.resumeUrl} target="_blank" rel="noreferrer">Resume</a></>}
              <p style={{ whiteSpace: "pre-wrap" }}>{a.coverLetter}</p>
              {a.aiReview ? (
                <div className="ai-review">
                  <strong>AI summary (advisory only) · fit {a.aiReview.fitScore ?? "n/a"}/10</strong>
                  <p>{a.aiReview.summary}</p>
                  {a.aiReview.strengths?.length > 0 && <p><em>Strengths:</em> {a.aiReview.strengths.join("; ")}</p>}
                  {a.aiReview.gaps?.length > 0 && <p><em>Gaps:</em> {a.aiReview.gaps.join("; ")}</p>}
                  <button type="button" className="btn small" onClick={() => reviewApplicant(a._id, true)} disabled={reviewBusy === a._id}>Refresh</button>
                  <p className="muted">Based on the cover letter only. A person makes the decision.</p>
                </div>
              ) : (
                <button type="button" className="btn small" onClick={() => reviewApplicant(a._id)} disabled={reviewBusy === a._id}>
                  {reviewBusy === a._id ? "Summarising..." : "AI summary"}
                </button>
              )}{" "}
              <select value={a.status} onChange={(e) => setStatus(a._id, e.target.value)}>
                <option>applied</option><option>shortlisted</option><option>rejected</option>
              </select>
            </div>
          )))}
        </div>
      ))}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === "employer" ? <Employer /> : <Candidate />;
}
