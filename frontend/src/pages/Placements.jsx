import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { getRole } from "../lib/auth";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import { latestTimestamp, markModuleSeen, MODULE_KEYS } from "../lib/notifications";
import { getPlacementYearOptions } from "../lib/studentOptions";

export default function Placements() {
  const role = getRole();
  const placementYears = useMemo(() => getPlacementYearOptions(), []);
  const [placementYear, setPlacementYear] = useState(String(new Date().getFullYear()));
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setErr(""); setMsg("");
    const params = role === "tpo" ? { placementYear } : undefined;
    api.get("/api/placements", { params })
      .then(r => { setItems(r.data || []); if (role === "student") markModuleSeen(MODULE_KEYS.placements, latestTimestamp(r.data || [])); })
      .catch(e => setErr(e?.response?.data?.message || "Failed to load placements"));
  };

  useEffect(() => { load(); }, [role, placementYear]);

  const download = async () => {
    setErr(""); setMsg("");
    try {
      const params = role === "tpo" ? { placementYear } : undefined;
      const res = await api.get("/api/placements/report/download", { params, responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placements_report_${role === "tpo" ? placementYear : "all"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMsg("Report downloaded!");
    } catch (e) {
      setErr(e?.response?.data?.message || "Download failed");
    }
  };

  const deletePlacement = async (placementId) => {
    if (!window.confirm("Delete this placement entry?")) return;
    setErr(""); setMsg("");
    try {
      await api.delete(`/api/placements/${placementId}`);
      setItems((prev) => prev.filter((x) => x._id !== placementId));
      setMsg("Placement deleted.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent:"space-between" }}>
          <h2>Placements</h2>
          <div className="row">
            <BackButton fallback="/placements" label="Back" />
            {role === "tpo" ? <button className="btn" onClick={download}>Download CSV</button> : null}
          </div>
        </div>

        {role === "tpo" ? (
          <div className="grid grid-2" style={{ marginTop: 12 }}>
            <div>
              <label>Placement Year</label>
              <select className="input" value={placementYear} onChange={(e) => setPlacementYear(e.target.value)}>
                {placementYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
        ) : null}

        {msg ? <p>{msg}</p> : null}
        {err ? <p style={{ color:"#b00020" }}>{err}</p> : null}

        <table className="table">
          <thead>
            <tr><th>Student</th><th>Placement Year</th><th>Company</th><th>Job</th><th>Package</th><th>Date</th>{role === "tpo" ? <th>Actions</th> : null}</tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p._id}>
                <td><strong>{p.student?.name}</strong><br/><small className="muted">{p.student?.email}</small></td>
                <td>{p.student?.placementYear || "-"}</td>
                <td>{p.company}</td>
                <td>{p.job?.title}</td>
                <td>{p.package || "-"}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                {role === "tpo" ? <td><button className="btn secondary" onClick={() => deletePlacement(p._id)}>Delete</button></td> : null}
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={role === "tpo" ? 7 : 6}><small className="muted">No placements yet{role === "tpo" ? ` for placement year ${placementYear}` : ""}.</small></td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
