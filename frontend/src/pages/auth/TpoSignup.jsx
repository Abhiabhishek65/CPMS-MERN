import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../../components/FormCard";
import api from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function TpoSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", collegeName:"", phone:"", previousPassword:"" });
  const [err, setErr] = useState("");
  const [needsPreviousPassword, setNeedsPreviousPassword] = useState(false);

  useEffect(() => {
    api.get("/")
      .catch(() => {});
  }, []);

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/auth/tpo/signup", form);
      saveAuth({ token: res.data.token, role: "tpo", user: res.data.user });
      nav("/tpo/dashboard");
    } catch (e2) {
      const message = e2?.response?.data?.message || "Signup failed";
      if (/Existing TPO password required/i.test(message)) setNeedsPreviousPassword(true);
      setErr(message);
    }
  };

  return (
    <FormCard title="TPO Signup" subtitle="Only the first TPO can register directly. To replace the TPO account, enter the previous TPO password.">
      <form onSubmit={submit} className="grid">
        <div>
          <label>Name</label>
          <input className="input" value={form.name} onChange={e=>onChange("name", e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input className="input" value={form.email} onChange={e=>onChange("email", e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>onChange("password", e.target.value)} />
        </div>

        <div className="grid grid-2">
          <div>
            <label>College Name</label>
            <input className="input" value={form.collegeName} onChange={e=>onChange("collegeName", e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={e=>onChange("phone", e.target.value)} />
          </div>
        </div>

        <div>
          <label>Previous TPO Password {needsPreviousPassword ? "(required)" : "(only when changing TPO)"}</label>
          <input className="input" type="password" value={form.previousPassword} onChange={e=>onChange("previousPassword", e.target.value)} />
        </div>

        {err ? <p style={{ color:"#b00020", margin:0 }}>{err}</p> : null}

        <button className="btn" type="submit">Create Account</button>
        <small className="muted">Already have an account? <Link to="/tpo/login">Login</Link></small>
      </form>
    </FormCard>
  );
}
