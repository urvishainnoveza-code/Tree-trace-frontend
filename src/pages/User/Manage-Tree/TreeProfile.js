import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const TreeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTreeProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get(`/plantation/${id}`);
        const payload = res.data || {};

        if ((payload.Status ?? payload.status) === 1) {
          setTree(payload.Plantation || payload.plantation || null);
        } else {
          setError(payload.Message || "Failed to fetch tree profile");
        }
      } catch (err) {
        setError(err.response?.data?.Message || "Failed to fetch tree profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTreeProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="container mt-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="alert alert-warning">Tree profile not found</div>
      </div>
    );
  }

  const planterName =
    tree.plantedBy?.firstName || tree.plantedBy?.lastName
      ? `${tree.plantedBy?.firstName || ""} ${tree.plantedBy?.lastName || ""}`.trim()
      : "-";

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">Tree Profile</h4>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <h6 className="text-muted">Tree Name</h6>
              <p>{tree.assign?.treeName?.name || "-"}</p>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted">Planted By</h6>
              <p>{planterName}</p>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <h6 className="text-muted">Country</h6>
              <p>{tree.assign?.country?.name || "-"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">State</h6>
              <p>{tree.assign?.state?.name || "-"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">City</h6>
              <p>{tree.assign?.city?.name || "-"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Area</h6>
              <p>{tree.assign?.area?.name || "-"}</p>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <h6 className="text-muted">Address</h6>
              <p>{tree.address || "-"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Planted Count</h6>
              <p>{tree.plantedCount ?? "-"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Health Status</h6>
              <p className="text-capitalize">{tree.healthStatus || "-"}</p>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <h6 className="text-muted">Cage</h6>
              <p>{tree.cage ? "Yes" : "No"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Watering</h6>
              <p>{tree.watering ? "Yes" : "No"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Fertilizer</h6>
              <p>{tree.fertilizer ? "Yes" : "No"}</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Age</h6>
              <p>{tree.age || "-"}</p>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <h6 className="text-muted">Fertilizer Detail</h6>
              <p>{tree.fertilizerDetail || "-"}</p>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted">Plantation Date</h6>
              <p>
                {tree.plantationDate
                  ? new Date(tree.plantationDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <div>
            <h6 className="text-muted">Images</h6>
            {Array.isArray(tree.images) && tree.images.length > 0 ? (
              <div className="d-flex gap-2 flex-wrap">
                {tree.images.map((imgPath, index) => (
                  <img
                    key={`${imgPath}-${index}`}
                    src={`${axiosInstance.defaults.baseURL}${imgPath}`}
                    alt={`tree-${index}`}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="mb-0">No images uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeProfile;
