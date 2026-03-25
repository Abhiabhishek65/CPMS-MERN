import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../../components/FormCard";
import api from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function StudentLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/auth/student/login", { email, password });
      saveAuth({ token: res.data.token, role: "student", user: res.data.user });
      nav("/student/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <FormCard title="Student Login">
      <form onSubmit={submit} className="grid">
        <div>
          <label>Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>

        {err ? <p style={{ color:"#b00020", margin:0 }}>{err}</p> : null}

        <button className="btn" type="submit">Login</button>
        <small className="muted" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span>Don't have an account? <Link to="/student/signup">Signup</Link></span><Link to="/student/forgot-password">Forgot Password?</Link></small>
      </form>
    </FormCard>
  );
}
