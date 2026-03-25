import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback = "/", label = "Back", className = "btn secondary" }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <button type="button" className={className} onClick={goBack}>
      {label}
    </button>
  );
}
