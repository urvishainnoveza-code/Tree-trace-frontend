import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { getUserType } from "../../../utils/auth";
import { toastSuccess, toastError } from "../../../utils/alertHelper";

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = getUserType();
  const isSuperAdmin = userType === "superAdmin";

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentDetail = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/assign/${id}`);
      console.log("Assignment Detail Response:", res.data);
      if (res.data.Status === 1) {
        // Support both 'data' and 'Data' response keys
        const assignmentData = res.data.data || res.data.Data;
        if (assignmentData) {
          console.log("👥 Group data:", assignmentData.group);
          setAssignment(assignmentData);
        } else {
          toastError("Assignment data not found in response");
          navigate("/manage-plantation/assignments");
        }
      } else {
        toastError(res.data.Message || "Assignment not found");
        navigate("/manage-plantation/assignments");
      }
    } catch (err) {
      toastError("Failed to fetch assignment details");
      navigate("/manage-plantation/assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelAssignment = async () => {
    if (!window.confirm("Cancel this assignment?")) return;

    try {
      const res = await axiosInstance.put(`/assign/${id}/cancel`);
      if (res.data.Status === 1) {
        toastSuccess("Assignment cancelled");
        fetchAssignmentDetail();
      } else {
        toastError(res.data.Message || "Failed to cancel assignment");
      }
    } catch (err) {
      toastError(err.response?.data?.Message || "Failed to cancel assignment");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const getStatusBadge = (status) => {
    const badges = {
      assigned: "bg-warning",
      completed: "bg-success",
      cancelled: "bg-danger",
    };
    return badges[status] || "bg-secondary";
  };

  // Helper to get member count from different possible fields
  const getUserCount = (group) => {
    if (!group) return 0;
    if (Array.isArray(group.users)) return group.users.length;
    if (typeof group.memberCount === "number") return group.memberCount;
    if (typeof group.usersCount === "number") return group.usersCount;
    if (typeof group.userCount === "number") return group.userCount;
    return 0;
    };
    
  return (
    <div className="container mt-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Assignment Details</h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/manage-plantation/assignments")}
          >
            Back to List
          </button>
        </div>

        <div className="card-body">
          {/* Status Badge */}
          <div className="mb-4">
            <span
              className={`badge ${getStatusBadge(assignment.status)} text-white px-3 py-2`}
            >
              {assignment.status?.toUpperCase()}
            </span>
          </div>

          {/* Assignment Info */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <h6 className="text-muted mb-1">Tree Name</h6>
              <p className="mb-0">{assignment.treeName?.name || "-"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h6 className="text-muted mb-1">Tree Count</h6>
              <p className="mb-0">{assignment.count}</p>
            </div>
          </div>

          {/* Location Info */}
          <div className="row mb-4">
            <div className="col-12">
              <h6 className="text-muted mb-2">Location</h6>
            </div>
            <div className="col-md-3 mb-2">
              <small className="text-muted">Country:</small>
              <p className="mb-0">{assignment.country?.name || "-"}</p>
            </div>
            <div className="col-md-3 mb-2">
              <small className="text-muted">State:</small>
              <p className="mb-0">{assignment.state?.name || "-"}</p>
            </div>
            <div className="col-md-3 mb-2">
              <small className="text-muted">City:</small>
              <p className="mb-0">{assignment.city?.name || "-"}</p>
            </div>
            <div className="col-md-3 mb-2">
              <small className="text-muted">Area:</small>
              <p className="mb-0">{assignment.area?.name || "-"}</p>
            </div>
            {assignment.address && (
              <div className="col-12 mt-2">
                <small className="text-muted">Address:</small>
                <p className="mb-0">{assignment.address}</p>
              </div>
            )}
          </div>

          {/* Group Info */}
          <div className="row mb-4">
            <div className="col-12">
              <h6 className="text-muted mb-2">Assigned Group</h6>
            </div>
            <div className="col-md-6 mb-2">
              <small className="text-muted">Group Name:</small>
              <p className="mb-0">{assignment.group?.name || "-"}</p>
            </div>
            <div className="col-md-6 mb-2">
              <small className="text-muted">Total User:</small>
              <p className="mb-0">{getUserCount(assignment.group)}</p>
            </div>
          </div>

          {/* Group Members */}
          {assignment.group?.users && assignment.group.users.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="text-muted mb-2">Group Members</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignment.group.users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            {user.firstName} {user.lastName}
                          </td>
                          <td>{user.email}</td>
                          <td>{user.mobile || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Metadata */}
          <div className="row">
            <div className="col-md-6 mb-2">
              <small className="text-muted">Assigned By:</small>
              <p className="mb-0">
                {assignment.assignedBy?.firstName}{" "}
                {assignment.assignedBy?.lastName}
              </p>
            </div>
            <div className="col-md-6 mb-2">
              <small className="text-muted">Assigned On:</small>
              <p className="mb-0">
                {assignment.createdAt
                  ? new Date(assignment.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isSuperAdmin && assignment.status === "assigned" && (
          <div className="card-footer d-flex justify-content-end gap-2">
            <button className="btn btn-danger" onClick={handleCancelAssignment}>
              Cancel Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
