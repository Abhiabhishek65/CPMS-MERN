import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../../components/FormCard";
import api from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function TpoLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/auth/tpo/login", { email, password });
      saveAuth({ token: res.data.token, role: "tpo", user: res.data.user });
      nav("/tpo/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <FormCard title="TPO Login">
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
        <small className="muted">Don't have an account? <Link to="/tpo/signup">Signup</Link></small>
      </form>
    </FormCard>
  );
}
