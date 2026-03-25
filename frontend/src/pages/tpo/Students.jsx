import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import { getPlacementYearOptions } from "../../lib/studentOptions";
import BackButton from "../../components/BackButton";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const placementYears = useMemo(() => getPlacementYearOptions(), []);
  const [placementYear, setPlacementYear] = useState(String(new Date().getFullYear()));

  const load = () => {
    setErr(""); setMsg("");
    api.get("/api/students", { params: { placementYear } })
      .then(r => setStudents(r.data))
      .catch(e => setErr(e?.response?.data?.message || "Failed to load students"));
  };

  useEffect(() => { load(); }, [placementYear]);

  const toggle = async (studentId, current) => {
    setErr(""); setMsg("");
    try {
      await api.patch(`/api/students/${studentId}/approval`, { isApproved: !current });
      setMsg("Updated!"); load();
    } catch (e) { setErr(e?.response?.data?.message || "Update failed"); }
  };

  const viewResume = async (studentId) => {
    setErr("");
    try {
      const response = await api.get(`/api/students/${studentId}/resume`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) { setErr(e?.response?.data?.message || "Resume open failed"); }
  };

  const openPhoto = async (studentId) => {
    setErr("");
    try {
      const response = await api.get(`/api/students/${studentId}/photo`, { responseType: "blob" });
      const contentType = response.headers?.["content-type"] || "image/jpeg";
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) { setErr(e?.response?.data?.message || "Photo open failed"); }
  };

  const downloadPhoto = async (studentId, name) => {
    try {
      const res = await api.get(`/api/students/${studentId}/photo`, { responseType: 'blob' });
      const contentType = res.headers?.['content-type'] || 'image/jpeg';
      const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${(name || 'student').replace(/\s+/g, '_')}_photo.${extension}`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (e) { setErr(e?.response?.data?.message || 'Photo download failed'); }
  };

  const removeStudent = async (studentId, studentName) => {
    const ok = window.confirm(`Remove ${studentName} from the student list?`);
    if (!ok) return;
    setErr(""); setMsg("");
    try { await api.delete(`/api/students/${studentId}`); setMsg("Student removed successfully!"); load(); }
    catch (e) { setErr(e?.response?.data?.message || "Remove failed"); }
  };

  const downloadCSV = async () => {
    setErr(''); setMsg('');
    try {
      const res = await api.get('/api/students/report/download', { params: { placementYear }, responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `students_${placementYear}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      setMsg('Report downloaded!');
    } catch (e) { setErr(e?.response?.data?.message || 'Download failed'); }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div><h2>Students Approval</h2><small className="muted">Filter students by placement year so each year data stays separate.</small></div>
          <div className="row" style={{ gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div><label>Placement Year</label><select className="input" value={placementYear} onChange={(e) => setPlacementYear(e.target.value)}>{placementYears.map(year => <option key={year} value={year}>{year}</option>)}</select></div>
            <button className="btn" onClick={downloadCSV}>Download CSV</button>
            <BackButton fallback="/tpo/dashboard" />
          </div>
        </div>

        {msg ? <p>{msg}</p> : null}
        {err ? <p style={{ color:"#b00020" }}>{err}</p> : null}

        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Study Year</th><th>Placement Year</th><th>Approved</th><th>Resume</th><th>Photo</th><th>Actions</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong><br /><small className="muted">{s.rollNo || "-"}</small></td>
                <td>{s.email}</td><td>{s.department || "-"}</td><td>{s.year || "-"}</td><td>{s.placementYear || "-"}</td>
                <td><span className="badge">{s.isApproved ? "YES" : "NO"}</span></td>
                <td>{s.resumeFile ? <button className="btn secondary" onClick={() => viewResume(s._id)}>View PDF</button> : <small className="muted">-</small>}</td>
                <td>{s.profilePhotoFile ? <div className="row" style={{ gap: 8, alignItems: "center" }}><button className="btn secondary" onClick={() => openPhoto(s._id)}>View</button><button type="button" className="icon-btn" title="Download photo" aria-label="Download photo" onClick={() => downloadPhoto(s._id, s.name)}>⬇</button></div> : <small className="muted">-</small>}</td>
                <td><div className="row" style={{ gap: 8, flexWrap: "wrap" }}><button className={`btn ${s.isApproved ? "danger" : ""}`} onClick={() => toggle(s._id, s.isApproved)}>{s.isApproved ? "Disapprove" : "Approve"}</button><button className="btn secondary" onClick={() => removeStudent(s._id, s.name)}>Remove</button></div></td>
              </tr>
            ))}
            {students.length === 0 ? <tr><td colSpan="9"><small className="muted">No students found for placement year {placementYear}.</small></td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
