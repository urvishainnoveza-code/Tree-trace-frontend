import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaTree, FaUsers } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { getUserType } from "../../../utils/auth";
import { toastSuccess, toastError } from "../../../utils/alertHelper";
import "./AssignmentDetail.css";

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = getUserType();
  const isSuperAdmin = userType === "superAdmin";

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentDetail = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/assign/${id}`);
      if (res.data.Status === 1) {
        setAssignment(res.data.data || res.data.Data);
      } else {
        toastError("Assignment not found");
        navigate("/manage-plantation/assignments");
      }
    } catch {
      toastError("Failed to fetch assignment");
      navigate("/manage-plantation/assignments");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAssignmentDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchAssignmentDetail]);

  const handleCancelAssignment = async () => {
    if (!window.confirm("Cancel this assignment?")) return;
    try {
      const res = await axiosInstance.put(`/assign/${id}/cancel`);
      if (res.data.Status === 1) {
        toastSuccess("Assignment cancelled");
        fetchAssignmentDetail();
      } else {
        toastError("Cancel failed");
      }
    } catch {
      toastError("Cancel failed");
    }
  };

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  if (!assignment) return null;

  // userCount removed as it was unused

  return (
    <div className="ad-container container-fluid">
      {/* HEADER */}
      <div className="ad-card">
        <div className="ad-header d-flex justify-content-between align-items-center">
          <div>
            <h4 className="commonindex-24">Assignment Details</h4>
            <div className="text-muted small">
              <FaTree color="#388e3c" style={{ marginRight: 2 }} />{" "}
              {assignment.treeName?.name} |
              <FaMapMarkerAlt
                color="#c13739"
                style={{ margin: "0 2px 2px 6px" }}
              />{" "}
              {assignment.city?.name}
            </div>
          </div>

          <span className={`badge ad-status ${assignment.status}`}>
            {assignment.status}
          </span>
        </div>

        {/* STATS */}
        <div className="row text-center mt-3">
          <div className="col-md-2">
            <small className="text-muted">Tree Count</small>
            <div className="text-muted-sm">{assignment.count}</div>
          </div>

          <div className="col-md-2">
            <small className="text-muted">Date</small>
            <div className="text-muted-sm">
              {new Date(assignment.createdAt).toLocaleDateString()}
            </div>
            <small className="text-muted">
              {new Date(assignment.createdAt).toLocaleTimeString()}
            </small>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className="ad-card">
        <h6 className="section-title">
          <FaMapMarkerAlt color="#c13739" style={{ marginRight: 4 }} /> Location
        </h6>
        <div className="row">
          <div className="col-md-3">
            <small className="text-muted">Country</small>
            <div>{assignment.country?.name || "-"}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">State</small>
            <div>{assignment.state?.name || "-"}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">City</small>
            <div>{assignment.city?.name || "-"}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Area</small>
            <div>{assignment.area?.name || "-"}</div>
          </div>
        </div>
      </div>

      {/* GROUP */}
      <div className="ad-card">
        <h6 className="section-title">
          <FaUsers color="#50478d" style={{ marginRight: 4 }} /> Group
        </h6>

        <small className="text-muted">Name:</small>
        <div>{assignment.group?.name || "-"}</div>

        {assignment.group?.users?.length > 0 && (
          <table className="table table-sm table-bordered mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {assignment.group.users.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.mobile || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/manage-plantation/assignments")}
        >
          Back
        </button>

        {isSuperAdmin && assignment.status === "assigned" && (
          <button className="btn btn-danger" onClick={handleCancelAssignment}>
            Cancel Assignment
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
