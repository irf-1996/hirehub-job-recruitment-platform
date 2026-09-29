import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Companies() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const load = () => api.get("/companies", { params: { q } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>Browse companies</h1>
      <form className="row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder="Search companies" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn">Search</button>
      </form>
      {list.length === 0 && <p className="muted">No companies found.</p>}
      {list.map((c) => (
        <Link to={`/companies/${encodeURIComponent(c.name)}`} key={c.name} className="card">
          <h3>{c.name}</h3>
          <p>{c.locations.join(" · ")}</p>
          <span className="tag">{c.openings} open {c.openings === 1 ? "job" : "jobs"}</span>
        </Link>
      ))}
    </>
  );
}