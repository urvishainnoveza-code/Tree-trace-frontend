import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import "./TreeProfile.css";

const TreeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await axiosInstance.get(`/plantation/${id}`);
        const data = res.data;

        if ((data.Status ?? data.status) === 1) {
          setTree(data.Plantation || data.plantation);
        } else {
          setError(data.Message || "Failed to fetch");
        }
      } catch (err) {
        setError(err.response?.data?.Message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTree();
  }, [id]);

  if (loading) {
    return (
      <div className="tp-container text-center">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tp-container">
        <button className="btn btn-primary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!tree) return null;

  const planterName = `${tree?.plantedBy?.firstName || ""} ${
    tree?.plantedBy?.lastName || ""
  }`.trim();

  const treeName = tree.assign?.treeName?.name || "-";

  return (
    <div className="tp-container container-fluid">
      {/* Back */}
      <button className="btn btn-primary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h4 className="commonindex-24">Tree Profile</h4>

      {/* BASIC INFO */}
      <div className="card tp-card mb-3">
        <div className="tp-card-title">Basic Information</div>

        <div className="row">
          <div className="col-md-3">
            <small className="text-muted">Tree Name</small>
            <h5>{treeName}</h5>
          </div>

          <div className="col-md-3">
            <small className="text-muted">Planted By</small>
            <div className="tp-planter">
              <div className="tp-avatar">
                {planterName ? planterName[0].toUpperCase() : "?"}
              </div>
              <span>{planterName || "-"}</span>
            </div>
          </div>

          <div className="col-md-3">
            <small className="text-muted">Health Status</small>
            <div>
              <span
                className={`badge tp-health ${
                  tree.healthStatus === "healthy"
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
                }`}
              >
                {tree.healthStatus || "-"}
              </span>
            </div>
          </div>

          <div className="col-md-3">
            <small className="text-muted">Planted Count</small>
            <div>{tree.plantedCount || "-"}</div>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className="card tp-card mb-3">
        <div className="tp-card-title">Location</div>

        <div className="d-flex flex-wrap gap-2 mb-2">
          {["country", "state", "city", "area"].map((key) => (
            <div key={key} className="tp-chip">
              <small className="text-muted">{key}</small>
              <div>{tree.assign?.[key]?.name || "-"}</div>
            </div>
          ))}
        </div>

        <small className="text-muted">Address</small>
        <div>{tree.address || "-"}</div>
      </div>

      {/* CARE */}
      <div className="card tp-card mb-3">
        <div className="tp-card-title">Care & Maintenance</div>

        <div className="row g-2">
          <div className="col-md-3">
            <div className="tp-care-box">
              🛡️ <br />
              <small>Cage</small>
              <div>{tree.cage ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="tp-care-box">
              💧 <br />
              <small>Watering</small>
              <div>{tree.watering ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="tp-care-box">
              🌱 <br />
              <small>Fertilizer</small>
              <div>{tree.fertilizer ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="tp-care-box gold">
              ⏳ <br />
              <small>Age</small>
              <div>{tree.age || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGES */}
      <div className="card tp-card mb-3">
        <div className="tp-card-title">Images</div>

        <div className="d-flex flex-wrap gap-2">
          {tree.images?.length ? (
            tree.images.map((img, i) => (
              <img
                key={i}
                className="tp-img"
                src={
                  img.startsWith("http")
                    ? img
                    : `${axiosInstance.defaults.baseURL}${img}`
                }
                alt=""
              />
            ))
          ) : (
            <p className="text-muted">No images uploaded</p>
          )}
        </div>
      </div>

      {/* FOOTER */}
    </div>
  );
};

export default TreeProfile;
