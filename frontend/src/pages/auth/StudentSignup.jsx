import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormCard from "../../components/FormCard";
import api from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { COURSE_OPTIONS, STUDY_YEAR_OPTIONS, getPlacementYearOptions } from "../../lib/studentOptions";

export default function StudentSignup() {
  const nav = useNavigate();
  const placementYears = useMemo(() => getPlacementYearOptions(), []);
  const [form, setForm] = useState({
    name:"",
    email:"",
    password:"",
    rollNo:"",
    department:"",
    year:"",
    placementYear:"",
    phone:""
  });
  const [err, setErr] = useState("");

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/auth/student/signup", form);
      saveAuth({ token: res.data.token, role: "student", user: res.data.user });
      nav("/student/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <FormCard title="Student Signup" subtitle="Create student account">
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
            <label>Roll No</label>
            <input className="input" value={form.rollNo} onChange={e=>onChange("rollNo", e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={e=>onChange("phone", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-2">
          <div>
            <label>Course</label>
            <select className="input" value={form.department} onChange={e=>onChange("department", e.target.value)}>
              <option value="">Select Course</option>
              {COURSE_OPTIONS.map(course => <option key={course} value={course}>{course}</option>)}
            </select>
          </div>
          <div>
            <label>Study Year</label>
            <select className="input" value={form.year} onChange={e=>onChange("year", e.target.value)}>
              <option value="">Select Year</option>
              {STUDY_YEAR_OPTIONS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label>Placement Year</label>
          <select className="input" value={form.placementYear} onChange={e=>onChange("placementYear", e.target.value)}>
            <option value="">Select Placement Year</option>
            {placementYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {err ? <p style={{ color:"#b00020", margin:0 }}>{err}</p> : null}

        <button className="btn" type="submit">Create Account</button>
        <small className="muted">Already have an account? <Link to="/student/login">Login</Link></small>
      </form>
    </FormCard>
  );
}
