import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">HireHub</Link>
        <div>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <span className="muted">{user.name} ({user.role})</span>
              <button className="btn small" onClick={logout}>Logout</button>
            </>
          ) : (
            <><Link to="/login">Login</Link><Link to="/register">Register</Link></>
          )}
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}
