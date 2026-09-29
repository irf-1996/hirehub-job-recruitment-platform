import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Auth({ mode }) {
  const isReg = mode === "register";
  const [f, setF] = useState({ name: "", email: "", password: "", role: "candidate", company: "" });
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/auth/${mode}`, f);
      login(data);
      nav("/dashboard");
    } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <form onSubmit={submit} className="card col narrow">
      <h1>{isReg ? "Create account" : "Login"}</h1>
      {isReg && <input placeholder="Full name" value={f.name} onChange={set("name")} required />}
      <input type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Password (6+ chars)" value={f.password} onChange={set("password")} required />
      {isReg && (
        <>
          <select value={f.role} onChange={set("role")}>
            <option value="candidate">I'm looking for a job</option>
            <option value="employer">I'm hiring</option>
          </select>
          {f.role === "employer" && <input placeholder="Company name" value={f.company} onChange={set("company")} />}
        </>
      )}
      {err && <p className="error">{err}</p>}
      <button className="btn">{isReg ? "Register" : "Login"}</button>
    </form>
  );
}
