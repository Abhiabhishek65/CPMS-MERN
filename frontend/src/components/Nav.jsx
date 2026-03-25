import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getRole, getUser } from "../lib/auth";
import api from "../lib/api";
import { hasUnseen, latestTimestamp, MODULE_KEYS } from "../lib/notifications";

function Dot({ show }) {
  if (!show) return null;
  return <span className="notif-dot" aria-hidden="true" />;
}

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const user = getUser();
  const [updates, setUpdates] = useState({ jobs: false, drives: false, notices: false, placements: false, interviews: false });

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  useEffect(() => {
    if (role !== "student") return;
    let cancelled = false;

    const load = async () => {
      try {
        const [jobsRes, drivesRes, noticesRes, placementsRes, interviewsRes] = await Promise.all([
          api.get("/api/jobs"),
          api.get("/api/drives"),
          api.get("/api/notices"),
          api.get("/api/placements"),
          api.get("/api/interviews/my")
        ]);
        if (cancelled) return;
        setUpdates({
          jobs: hasUnseen(MODULE_KEYS.jobs, latestTimestamp(jobsRes.data || [])),
          drives: hasUnseen(MODULE_KEYS.drives, latestTimestamp(drivesRes.data || [])),
          notices: hasUnseen(MODULE_KEYS.notices, latestTimestamp(noticesRes.data || [])),
          placements: hasUnseen(MODULE_KEYS.placements, latestTimestamp(placementsRes.data || [])),
          interviews: hasUnseen(MODULE_KEYS.interviews, latestTimestamp(interviewsRes.data || []))
        });
      } catch {
        if (!cancelled) setUpdates({ jobs: false, drives: false, notices: false, placements: false, interviews: false });
      }
    };

    load();
    const handler = () => load();
    window.addEventListener("cpms-notifications-updated", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("cpms-notifications-updated", handler);
    };
  }, [role]);

  const navClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
  const hideStudentModuleLinks = role === "student" && location.pathname === "/student/dashboard";
  const hideTpoModuleLinks = role === "tpo";
  const hideModuleLinks = hideStudentModuleLinks || hideTpoModuleLinks;

  return (
    <div className="nav">
      <div className="nav-left" style={{ display: "flex", color: "white", alignItems: "center", gap: "10px" }}>
        <strong style={{ fontSize: "18px" }}>CPMS</strong>
        {role && <span className="badge">{role.toUpperCase()}</span>}
      </div>

      <div className="links">
        <NavLink className={navClass} to="/">Home</NavLink>

        {!hideModuleLinks ? (
          <>
            <NavLink className={navClass} to="/jobs"><span className="nav-with-dot">Jobs<Dot show={role === "student" && updates.jobs} /></span></NavLink>
            <NavLink className={navClass} to="/drives"><span className="nav-with-dot">Drives<Dot show={role === "student" && updates.drives} /></span></NavLink>
            <NavLink className={navClass} to="/notices"><span className="nav-with-dot">Notices<Dot show={role === "student" && updates.notices} /></span></NavLink>
            <NavLink className={navClass} to="/placements"><span className="nav-with-dot">Placements<Dot show={role === "student" && updates.placements} /></span></NavLink>
          </>
        ) : null}

        {role === "student" && <NavLink className={navClass} to="/student/dashboard">Student Dashboard</NavLink>}

        {role === "tpo" && (
          <>
            <NavLink className={navClass} to="/tpo/dashboard">TPO Dashboard</NavLink>
            <NavLink className={navClass} to="/tpo/students">Students Approval</NavLink>
          </>
        )}

        {role ? (
          <>
            <small className="muted" style={{ marginLeft: "10px" }}>{user?.name}</small>
            <button className="btn secondary" onClick={logout} style={{ marginLeft: "8px" }}>Logout</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
