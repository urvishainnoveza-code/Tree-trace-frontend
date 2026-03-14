import React from "react";
// import CommonCard from "../../components/common-components/CommonCard";
import { useNavigate } from "react-router-dom";
import "../../pages/global.css";

const MasterSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="container">
        {/* Geolocation Master Row */}
        <div className="mb-4">
          <h4 className="fw-bold mb-3 text-center">Geolocation Master</h4>
          <div className="row justify-content-center">
            <div className="col-md-3 mb-3">
              <div
                className="card shadow-sm h-100"
                onClick={() => navigate("/countries")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">Country</h5>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div
                className="card shadow-sm h-100"
                onClick={() => navigate("/states")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">State</h5>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div
                className="card shadow-sm h-100"
                onClick={() => navigate("/cities")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">City</h5>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div
                className="card shadow-sm h-100"
                onClick={() => navigate("/areas")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">Area</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Treename Master Row */}
        <div className="mt-5">
          <h4 className="fw-bold mb-3 text-center">Treename Master</h4>
          <div className="row justify-content-center">
            <div className="col-md-3 mb-3">
              <div
                className="card shadow-sm h-100"
                onClick={() => navigate("/treename")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">Treename</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterSettings;
