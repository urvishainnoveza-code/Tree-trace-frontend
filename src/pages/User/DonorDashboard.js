import React from "react";
import { useNavigate } from "react-router-dom";
import "../../components/common-components/common.css";

export default function DonorDashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Donor Dashboard</h2>
        <button
          style={{
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
          }}
          onClick={() => navigate("/donate-tree")}
        >
          Donate Tree
        </button>
      </div>
      {/* ...existing dashboard content... */}
    </div>
  );
}
