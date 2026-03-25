import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../../components/FormCard";
import api from "../../lib/api";

export default function StudentForgotPassword() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', phone: '', newPassword: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.post('/api/auth/student/forgot-password', form);
      setMsg('Password reset successful. Redirecting to login...');
      setTimeout(() => nav('/student/login'), 1200);
    } catch (e2) {
      setErr(e2?.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <FormCard title="Student Forgot Password" subtitle="Enter registered email and phone number to set a new password.">
      <form onSubmit={submit} className="grid">
        <div><label>Email</label><input className="input" value={form.email} onChange={(e) => onChange('email', e.target.value)} /></div>
        <div><label>Registered Phone Number</label><input className="input" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} /></div>
        <div><label>New Password</label><input className="input" type="password" value={form.newPassword} onChange={(e) => onChange('newPassword', e.target.value)} /></div>
        {msg ? <p>{msg}</p> : null}
        {err ? <p style={{ color:'#b00020', margin:0 }}>{err}</p> : null}
        <button className="btn" type="submit">Reset Password</button>
        <small className="muted"><Link to="/student/login">Back to login</Link></small>
      </form>
    </FormCard>
  );
}
