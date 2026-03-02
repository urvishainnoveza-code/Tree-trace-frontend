import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { getUserType } from "../../../utils/auth";
import { toastSuccess, toastError } from "../../../utils/alertHelper";
import CommonTable from "../../../components/common-components/CommonTable";

const ViewAssignments = () => {
  const navigate = useNavigate();
  const userType = getUserType();
  const isSuperAdmin = userType === "superAdmin";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit,
        };

        const res = await axiosInstance.get("/assign", { params });

        console.log("Assignments Response:", res.data);

        if (res.data.Status === 1) {
          setAssignments(res.data.data || res.data.Data || []);
          setTotalPages(res.data.TotalPages || res.data.totalPages || 1);
          setTotalRecords(res.data.TotalRecords || res.data.totalRecords || 0);
        } else {
          console.log("No assignments or Status !== 1:", res.data);
          setAssignments([]);
        }
      } catch (err) {
        console.error("Fetch assignments error:", err);
        toastError(
          err.response?.data?.Message || "Failed to fetch assignments",
        );
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentPage]);

  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm("Cancel this assignment?")) return;

    try {
      const res = await axiosInstance.put(`/assign/${assignmentId}/cancel`);
      if (res.data.Status === 1) {
        toastSuccess("Assignment cancelled");
        setCurrentPage(1);
      } else {
        toastError(res.data.Message || "Failed to cancel assignment");
      }
    } catch (err) {
      toastError(err.response?.data?.Message || "Failed to cancel assignment");
    }
  };

  const handleViewDetail = (assignmentId) => {
    navigate(`/manage-plantation/assignment/${assignmentId}`);
  };

  const tableColumns = [
    { label: "Tree Name", key: "treeName.name" },
    { label: "Count", key: "count" },
    { label: "City", key: "city.name" },
    { label: "Area", key: "area.name" },
    { label: "Group", key: "group.name" },
    {
      label: "Status",
      key: "status",
      valueMap: {
        assigned: "Assigned",
        completed: "Completed",
        cancelled: "Cancelled",
      },
    },
  ];

  const getActions = (row) => {
    const actions = [];

    actions.push({
      label: "View Details",
      onClick: () => handleViewDetail(row._id),
      className: "btn btn-sm btn-info",
    });

    if (isSuperAdmin && row.status === "assigned") {
      actions.push({
        label: "Cancel",
        onClick: () => handleCancelAssignment(row._id),
        className: "btn btn-sm btn-danger",
      });
    }

    return actions;
  };

  return (
    <div className="container mt-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tree Assignments</h5>
          {isSuperAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/manage-plantation/assign")}
            >
              + Assign Trees
            </button>
          )}
        </div>

        <div className="card-body">
          {/* Table */}
          <CommonTable
            columns={tableColumns}
            data={assignments}
            loading={loading}
            actions={getActions}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
              limit,
            }}
          />

          {/* Summary */}
          <div className="mt-2 text-muted">
            Showing {assignments.length} of {totalRecords} assignments
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignments;
