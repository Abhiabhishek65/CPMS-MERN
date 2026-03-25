import { useEffect } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "../lib/auth";

export default function Home() {
  const auth = getAuth();

  useEffect(() => {
    document.body.classList.add("college-theme");
    return () => document.body.classList.remove("college-theme");
  }, []);


  return (
    <div className="container home-page-flow" style={{ paddingTop: 18 }}>
      <header className="topbar">
        <div className="brand">
          <div className="logoCircle">
  {
  }
  { <img className="logoImg" src={new URL("../assets/colg_logo.jpeg", import.meta.url).href} alt="College Logo" /> }
  
</div>
          <div className="brandText">
            <div className="brandName">ITM COLLEGE OF MANAGEMENT</div>
            <div className="brandTag">College Placement Management System</div>
          </div>
        </div>

        <nav className="topnav">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <Link to="/student/login">Student</Link>
          <Link to="/tpo/login">TPO</Link>
        </nav>
      </header>

      <section id="home" className="homeHero">
        <div className="homeHeroInner">
          <h1>Build your career with campus opportunities ...</h1>
          <p>
            Apply for jobs, register for drives, track interviews, and view placement updates —
            all in one system.
          </p>

          <div className="homeCtas">
            <Link className="btn" to="/jobs">Explore Jobs</Link>
            <Link className="btn secondary" to="/drives">Upcoming Drives</Link>
            <Link className="btn secondary" to="/placements">Placements</Link>
          </div>

          {auth?.token ? (
            <div style={{ marginTop: 10 }}>
              <span className="pill">You are logged in as <b>{String(auth.role || "").toUpperCase()}</b></span>
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <span className="pill">Login to access dashboards</span>
            </div>
          )}
        </div>
      </section>

      <section className="homeGrid homeAboutGrid">
        <div className="infoCard aboutFullCard" id="about">
          <span className="aboutEyebrow">About Us</span>
         
          <p>
            The College Placement Management System (CPMS) is a comprehensive digital platform designed to modernize and streamline the campus recruitment process. It serves as a centralized ecosystem that connects students, the Training & Placement Office (TPO), and recruiters, ensuring a smooth, transparent, and efficient placement experience.
          </p>
          <p>
            CPMS simplifies every stage of placement activities — from job postings and student registrations to application tracking, interview coordination, and placement updates. By reducing manual work and improving visibility, the platform helps institutions manage recruitment operations with greater accuracy, consistency, and ease.
          </p>
          <p>
            With a strong focus on usability, reliability, and performance, CPMS enables students to manage their profiles, upload resumes, explore opportunities, and stay informed in real time, while supporting the TPO with structured workflows, better coordination, and effective placement management.
          </p>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} ITM COLLEGE OF MANAGEMENT — Placement Cell
      </footer>
    </div>
  );
}
