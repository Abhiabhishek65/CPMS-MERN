import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import BackButton from "../../components/BackButton";

const statuses = ["REGISTERED", "PRESENT", "ABSENT"];

export default function DriveRegistrations() {
  const { driveId } = useParams();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setErr(""); setMsg("");
    api.get(`/api/drives/${driveId}/registrations`)
      .then(r => setItems(r.data))
      .catch(e => setErr(e?.response?.data?.message || "Failed to load"));
  };

  useEffect(() => { load(); }, [driveId]);

  const update = async (regId, status) => {
    setErr(""); setMsg("");
    try {
      await api.patch(`/api/drives/registration/${regId}/attendance`, { status });
      setMsg("Updated!");
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    }
  };

  const download = async () => {
    setErr(""); setMsg("");
    try {
      const res = await api.get(`/api/drives/${driveId}/report`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "drive_registrations.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMsg("Report downloaded!");
    } catch (e) {
      setErr(e?.response?.data?.message || "Download failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent:"space-between" }}>
          <h2>Drive Registrations</h2>
          <div className="row">
            <button className="btn" onClick={download}>Download CSV</button>
            <BackButton fallback="/drives" />
          </div>
        </div>

        {msg ? <p>{msg}</p> : null}
        {err ? <p style={{ color:"#b00020" }}>{err}</p> : null}

        <table className="table">
          <thead>
            <tr><th>Student</th><th>Email</th><th>Dept</th><th>Approved</th><th>Attendance</th></tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x._id}>
                <td><strong>{x.student?.name}</strong><br/><small className="muted">{x.student?.rollNo || "-"}</small></td>
                <td>{x.student?.email}</td>
                <td>{x.student?.department || "-"}</td>
                <td><span className="badge">{x.student?.isApproved ? "YES" : "NO"}</span></td>
                <td>
                  <select className="input" value={x.status} onChange={e => update(x._id, e.target.value)}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan="5"><small className="muted">No registrations yet.</small></td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
