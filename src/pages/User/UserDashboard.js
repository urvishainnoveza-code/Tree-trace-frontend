import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getUser } from "../../utils/auth";

function UserDashboard() {
  // Removed unused groups state
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = getUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch all groups for this user
        const userId = currentUser?._id;
        if (!userId) {
          setError("User not found.");
          setLoading(false);
          return;
        }
        const groupsRes = await axiosInstance.get("/groups");
        let userGroups = groupsRes.data?.data || groupsRes.data?.Data || [];
        // Filter groups where user is a member
        userGroups = userGroups.filter(
          (g) => g.users && g.users.some((u) => u._id === userId),
        );

        //Fetch all assignments
        const assignRes = await axiosInstance.get("/assign");
        const assignments = assignRes.data?.data || [];

        //Fetch all plantations
        const plantationsRes = await axiosInstance.get("/plantation");
        const plantations = plantationsRes.data?.Plantation || [];
        const data = userGroups.map((group) => {
          // Assigned trees: sum assignment counts for this group
          const groupAssignments = assignments.filter(
            (a) => a.group && a.group._id === group._id,
          );
          const assignedTrees = groupAssignments.reduce(
            (sum, a) => sum + (a.count || 0),
            0,
          );
          // Planted trees: sum plantations for this group
          const groupPlantations = plantations.filter(
            (p) =>
              p.assign && p.assign.group && p.assign.group._id === group._id,
          );
          const plantedTrees = groupPlantations.reduce(
            (sum, p) => sum + (p.plantedCount || 0),
            0,
          );
          // Group members
          const members = group.users || [];
          return {
            groupName: group.name,
            memberCount: members.length,
            assignedTrees,
            plantedTrees,
            members,
          };
        });
        setDashboardData(data);
      } catch (err) {
        setError(
          err.response?.data?.Message || "Error loading dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">User Dashboard</h2>
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger mt-3">{error}</div>
      ) : dashboardData.length > 0 ? (
        dashboardData.map((row, idx) => (
          <div key={idx} className="mb-5">
            {/* Group Name Card */}
            <div
              className="dashboard-card mb-3 p-3"
              style={{ background: "#f8f9fa", borderRadius: 8 }}
            >
              <h4 className="mb-2">
                {" "}
                <span className="group-name">{row.groupName}</span>
              </h4>
            </div>
            <div className="row mb-4">
              <div className="col-md-4 col-12 mb-2">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center">
                    <div className="card-title fw-bold">Group Members</div>
                    <div className="display-6 text-primary">
                      {row.memberCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-2">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center">
                    <div className="card-title fw-bold">Assigned Trees</div>
                    <div className="display-6 text-success">
                      {row.assignedTrees}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-2">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center">
                    <div className="card-title fw-bold">Planted Trees</div>
                    <div className="display-6 text-warning">
                      {row.plantedTrees}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Members Table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover mt-3">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {row.members.map((member, mIdx) => (
                    <tr key={mIdx}>
                      <td>
                        {member.firstName} {member.lastName}
                      </td>
                      <td>{member.email}</td>
                      <td>{member.phoneNo || member.mobile || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-warning mt-3">No group data found.</div>
      )}
    </div>
  );
}

export default UserDashboard;
