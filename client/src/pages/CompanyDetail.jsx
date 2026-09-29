import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api.js";

export default function CompanyDetail() {
  const { name } = useParams();
  const [jobs, setJobs] = useState(null);
  useEffect(() => { api.get("/jobs", { params: { company: name } }).then((r) => setJobs(r.data)); }, [name]);

  return (
    <>
      <p><Link to="/companies">← All companies</Link></p>
      <h1>{name}</h1>
      {jobs === null && <p>Loading...</p>}
      {jobs?.length === 0 && <p className="muted">No open jobs at this company.</p>}
      {jobs?.map((j) => (
        <Link to={`/jobs/${j._id}`} key={j._id} className="card">
          <h3>{j.title}</h3>
          <p>{j.location}</p>
          <span className="tag">{j.type}</span> {j.salary && <span className="tag">{j.salary}</span>}
        </Link>
      ))}
    </>
  );
}
