import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import { Link } from "react-router-dom";

function QuickLink({ title, subtitle, to, actions }) {
  return (
    <div className="card quick-link-card" style={{ boxShadow: "none", border: "1px solid #eee" }}>
      <Link to={to} style={{ display: "block" }}>
        <strong>{title}</strong>
        <div style={{ marginTop: 6 }}>
          <small className="muted">{subtitle}</small>
        </div>
      </Link>
      {actions ? <div className="row" style={{ marginTop: 12 }}>{actions}</div> : null}
    </div>
  );
}

export default function TpoDashboard() {
  const user = getUser();
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notices, setNotices] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [err, setErr] = useState("");

  const loadDashboard = async () => {
    try {
      const [jobsRes, drivesRes, noticesRes, placementsRes] = await Promise.all([
        api.get("/api/jobs"),
        api.get("/api/drives"),
        api.get("/api/notices"),
        api.get("/api/placements")
      ]);
      setJobs(jobsRes.data || []);
      setDrives(drivesRes.data || []);
      setNotices(noticesRes.data || []);
      setPlacements(placementsRes.data || []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2>TPO Dashboard</h2>
            <small className="muted">{user?.name} • {user?.email}</small>
          </div>
          <div className="row">
            <Link className="btn" to="/tpo/jobs/new">+ Job</Link>
            <Link className="btn secondary" to="/tpo/drives/new">+ Drive</Link>
            <Link className="btn secondary" to="/tpo/notices/new">+ Notice</Link>
          </div>
        </div>

        {err ? <p style={{ color: "#b00020" }}>{err}</p> : null}

        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <QuickLink
            title="Jobs"
            subtitle={`${jobs.length} jobs available. View applicants, edit jobs, and manage hiring posts.`}
            to="/jobs"
            actions={
              <>
                <Link className="btn secondary" to="/jobs">Open Jobs</Link>
                <Link className="btn secondary" to="/tpo/jobs/new">Create Job</Link>
              </>
            }
          />
          <QuickLink
            title="Drives"
            subtitle={`${drives.length} drives created. Check campus drive details and registrations.`}
            to="/drives"
            actions={
              <>
                <Link className="btn secondary" to="/drives">Open Drives</Link>
                <Link className="btn secondary" to="/tpo/drives/new">Create Drive</Link>
              </>
            }
          />
          <QuickLink
            title="Notices"
            subtitle={`${notices.length} notices published. Create updates and manage student notices.`}
            to="/notices"
            actions={
              <>
                <Link className="btn secondary" to="/notices">Open Notices</Link>
                <Link className="btn secondary" to="/tpo/notices/new">Create Notice</Link>
              </>
            }
          />
          <QuickLink
            title="Placements"
            subtitle={`${placements.length} placement records available. Review selected students and reports.`}
            to="/placements"
            actions={<Link className="btn secondary" to="/placements">Open Placements</Link>}
          />
        </div>

        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <div className="kpi">
            <strong>Students Approval</strong>
            <div style={{ marginTop: 8 }}>
              <small className="muted">Approve students, view profile documents, and download reports.</small>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn secondary" to="/tpo/students">Open Students</Link>
            </div>
          </div>
          <div className="kpi">
            <strong>Quick Summary</strong>
            <div style={{ marginTop: 8 }}>
              <small className="muted">Jobs: {jobs.length} • Drives: {drives.length} • Notices: {notices.length} • Placements: {placements.length}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
