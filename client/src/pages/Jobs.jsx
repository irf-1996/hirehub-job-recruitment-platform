import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [f, setF] = useState({ q: "", location: "", type: "" });
  const load = () => api.get("/jobs", { params: f }).then((r) => setJobs(r.data));
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>Find your next job</h1>
      <form className="row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder="Title or company" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <input placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="">All types</option>
          {["Full-time", "Part-time", "Contract", "Remote"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn">Search</button>
      </form>
      {jobs.length === 0 && <p className="muted">No jobs found.</p>}
      {jobs.map((j) => (
        <Link to={`/jobs/${j._id}`} key={j._id} className="card">
          <h3>{j.title}</h3>
          <p>{j.company} · {j.location}</p>
          <span className="tag">{j.type}</span> {j.salary && <span className="tag">{j.salary}</span>}
        </Link>
      ))}
    </>
  );
}
