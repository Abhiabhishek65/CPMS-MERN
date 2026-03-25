import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import BackButton from "../../components/BackButton";

const statuses = ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"];
const defaultSchedule = { round: "Round 1", dateTime: "", mode: "OFFLINE", location: "", note: "" };

function toInputDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Applicants() {
  const { jobId } = useParams();
  const [apps, setApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [scheduleFor, setScheduleFor] = useState("");
  const [shortlistChoiceFor, setShortlistChoiceFor] = useState("");
  const [form, setForm] = useState(defaultSchedule);

  const interviewMap = useMemo(() => {
    const map = new Map();
    (interviews || []).forEach((item) => {
      const id = item?.application?._id;
      if (id) map.set(String(id), item);
    });
    return map;
  }, [interviews]);

  const load = () => {
    setErr(""); setMsg("");
    Promise.all([
      api.get(`/api/applications/job/${jobId}`),
      api.get(`/api/interviews/job/${jobId}`)
    ])
      .then(([appsRes, interviewsRes]) => {
        setApps(appsRes.data || []);
        setInterviews(interviewsRes.data || []);
      })
      .catch(e => setErr(e?.response?.data?.message || "Failed to load applicants"));
  };

  useEffect(() => { load(); }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    setErr(""); setMsg("");
    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status });
      setMsg(`Status changed to ${status}.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    }
  };

  const onStatusChange = async (app, status) => {
    if (status === "SHORTLISTED") {
      const existing = interviewMap.get(String(app._id));
      setShortlistChoiceFor(app._id);
      setScheduleFor("");
      setForm(existing ? {
        round: existing.round || "Round 1",
        dateTime: toInputDateTime(existing.dateTime),
        mode: existing.mode || "OFFLINE",
        location: existing.location || "",
        note: existing.note || ""
      } : {
        ...defaultSchedule,
        dateTime: toInputDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000))
      });
      return;
    }
    setShortlistChoiceFor("");
    setScheduleFor("");
    setForm(defaultSchedule);
    await updateStatus(app._id, status);
  };

  const shortlistOnly = async (applicationId) => {
    setErr(""); setMsg("");
    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status: "SHORTLISTED" });
      setMsg("Applicant shortlisted.");
      setShortlistChoiceFor("");
      setScheduleFor("");
      setForm(defaultSchedule);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Shortlist failed");
    }
  };

  const openSchedule = (applicationId) => {
    setShortlistChoiceFor("");
    setScheduleFor(applicationId);
  };

  const saveInterview = async (applicationId) => {
    if (!form.dateTime) {
      setErr("Interview date & time required");
      return;
    }
    setErr(""); setMsg("");
    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status: "SHORTLISTED" });
      const existing = interviewMap.get(String(applicationId));
      await api.post(`/api/interviews/application/${applicationId}`, form);
      setMsg(existing?._id ? "Shortlist and interview updated." : "Applicant shortlisted and interview scheduled.");
      setShortlistChoiceFor("");
      setScheduleFor("");
      setForm(defaultSchedule);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Interview scheduling failed");
    }
  };

  const downloadCSV = async () => {
    setErr(""); setMsg("");
    try {
      const res = await api.get(`/api/applications/job/${jobId}/report`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applicants_report.csv";
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
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>Applicants</h2>
          <div className="row">
            <button className="btn" onClick={downloadCSV}>Download CSV Report</button>
            <BackButton fallback="/jobs" />
          </div>
        </div>

        {msg ? <p>{msg}</p> : null}
        {err ? <p style={{ color:"#b00020" }}>{err}</p> : null}

        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Department</th>
              <th>Approved</th>
              <th>Status</th>
              <th>Interview</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(a => {
              const interview = interviewMap.get(String(a._id));
              return (
                <React.Fragment key={a._id}>
                  <tr>
                    <td><strong>{a.student?.name}</strong><br /><small className="muted">{a.student?.rollNo || "-"}</small></td>
                    <td>{a.student?.email}</td>
                    <td>{a.student?.department || "-"}</td>
                    <td><span className="badge">{a.student?.isApproved ? "YES" : "NO"}</span></td>
                    <td><span className="badge">{a.status}</span></td>
                    <td>
                      {interview ? (
                        <div>
                          <strong>{interview.round}</strong><br />
                          <small className="muted">{new Date(interview.dateTime).toLocaleString()}</small>
                        </div>
                      ) : <small className="muted">No interview</small>}
                    </td>
                    <td>
                      <select className="input" value={a.status} onChange={e => onStatusChange(a, e.target.value)}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {shortlistChoiceFor === a._id ? (
                    <tr>
                      <td colSpan="7">
                        <div className="card" style={{ margin: 0, background: "#fafcff" }}>
                          <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <strong>Shortlist Applicant</strong>
                            <button className="btn secondary" onClick={() => { setShortlistChoiceFor(""); setScheduleFor(""); setForm(defaultSchedule); }}>Cancel</button>
                          </div>
                          <p className="muted" style={{ marginTop: 10 }}>Aap chahein to sirf shortlisted mark kar sakte hain, ya isi time individual interview details bhi add kar sakte hain.</p>
                          <div className="row" style={{ marginTop: 10, gap: 10, flexWrap: "wrap" }}>
                            <button className="btn secondary" onClick={() => shortlistOnly(a._id)}>Shortlist Only</button>
                            <button className="btn" onClick={() => openSchedule(a._id)}>Shortlist + Schedule Interview</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {scheduleFor === a._id ? (
                    <tr>
                      <td colSpan="7">
                        <div className="card" style={{ margin: 0, background: "#fafcff" }}>
                          <div className="row" style={{ justifyContent: "space-between" }}>
                            <strong>Schedule Interview</strong>
                            <button className="btn secondary" onClick={() => { setShortlistChoiceFor(""); setScheduleFor(""); setForm(defaultSchedule); }}>Cancel</button>
                          </div>
                          <div className="grid grid-2" style={{ marginTop: 10 }}>
                            <div>
                              <label>Round</label>
                              <input className="input" value={form.round} onChange={(e) => setForm((s) => ({ ...s, round: e.target.value }))} />
                            </div>
                            <div>
                              <label>Date & Time *</label>
                              <input className="input" type="datetime-local" value={form.dateTime} onChange={(e) => setForm((s) => ({ ...s, dateTime: e.target.value }))} />
                            </div>
                            <div>
                              <label>Mode</label>
                              <select className="input" value={form.mode} onChange={(e) => setForm((s) => ({ ...s, mode: e.target.value }))}>
                                <option value="OFFLINE">OFFLINE</option>
                                <option value="ONLINE">ONLINE</option>
                              </select>
                            </div>
                            <div>
                              <label>Location / Link</label>
                              <input className="input" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
                            </div>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <label>Note</label>
                            <textarea className="input" rows="3" value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
                          </div>
                          <div className="row" style={{ marginTop: 10 }}>
                            <button className="btn" onClick={() => saveInterview(a._id)}>Save Shortlist + Interview</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
            {apps.length === 0 ? (
              <tr><td colSpan="7"><small className="muted">No applicants yet.</small></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
