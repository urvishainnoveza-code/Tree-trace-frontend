import React from "react";
import { useNavigate } from "react-router-dom";
import "../../components/common-components/common.css";

const geoCards = [
  { label: "Country", route: "/countries", icon: "🌍", desc: "Manage country list" },
  { label: "State", route: "/states", icon: "🗺️", desc: "Manage state list" },
  { label: "City", route: "/cities", icon: "🏙️", desc: "Manage city list" },
  { label: "Area", route: "/areas", icon: "📍", desc: "Manage area list" },
];

const MasterSetting = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid ms-wrap">

      {/* Hero */}
      <div className="ms-hero">
        <div className="ms-hero-badge">⚙️ Master Configuration</div>
        <h2 className="ms-hero-title">Geolocation & Tree Masters</h2>
        <p className="ms-hero-sub">
          Manage all foundational data like locations and tree classifications.
        </p>
      </div>

      {/* Geolocation */}
      <div className="ms-section">
        <h4 className="ms-section-title">Geolocation Master</h4>

        <div className="row g-3">
          {geoCards.map((card) => (
            <div key={card.label} className="col-lg-3 col-md-6 col-12">
              <div
                className="ms-card"
                onClick={() => navigate(card.route)}
              >
                <div className="ms-card-icon">{card.icon}</div>
                <div>
                  <div className="ms-card-label">{card.label}</div>
                  <div className="ms-card-meta">{card.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
      {/* Treename */}
      <div className="ms-section">
        <h4 className="ms-section-title">Treename Master</h4>

        <div
          className="ms-treename-card"
          onClick={() => navigate("/treename")}
        >
          <div className="ms-treename-icon">🌳</div>
          <div>
            <div className="ms-card-label">Treename</div>
            <div className="ms-card-meta">Manage treename list</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MasterSetting;