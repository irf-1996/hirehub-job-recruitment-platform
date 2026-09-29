import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ coverLetter: "", resumeUrl: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch(() => setJob(false)); }, [id]);

  const apply = async (e) => {
    e.preventDefault();
    try { await api.post(`/applications/${id}`, form); setMsg("Application submitted!"); }
    catch (err) { setMsg(errMsg(err)); }
  };

  if (job === false) return <p>Job not found.</p>;
  if (!job) return <p>Loading...</p>;
  return (
    <div className="card">
      <h1>{job.title}</h1>
      <p><Link to={`/companies/${encodeURIComponent(job.company)}`}>{job.company}</Link> · {job.location} · {job.type} {job.salary && `· ${job.salary}`}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
      <hr />
      {!user && <p><Link to="/login">Log in</Link> as a candidate to apply.</p>}
      {user?.role === "candidate" && (
        <form onSubmit={apply} className="col">
          <h3>Apply</h3>
          <input placeholder="Resume link (Google Drive, LinkedIn, etc.)" value={form.resumeUrl}
            onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} />
          <textarea rows="5" placeholder="Cover letter" value={form.coverLetter}
            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
          <button className="btn">Submit application</button>
        </form>
      )}
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}