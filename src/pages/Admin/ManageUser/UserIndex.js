import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
//import CommonFilter from "../../../components/common-components/CommonFilter";
import AddUser from "./AddUser";
import { useNavigate } from "react-router-dom";

const UserIndex = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
      };

      const res = await axiosInstance.get("/users", { params });

      if (res.data.Status === 1) {
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalUsers(res.data.data.totalUsers || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      alert(err.response?.data?.Message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchUsers(1, query);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchQuery);
  };

  const handleAddUser = () => {
    setShowAddUser(true);
  };

  const handleCloseAddUser = () => {
    setShowAddUser(false);
  };

  const handleAddUserSuccess = () => {
    fetchUsers(1);
  };

  const handleEdit = (userId) => {
    navigate(`/admin/manage-users/edit/${userId}`);
  };

  const handleView = (userId) => {
    navigate(`/admin/manage-users/view/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axiosInstance.delete(`/users/${userId}`);
        if (res.data.Status === 1) {
          alert("User deleted successfully");
          fetchUsers(currentPage, searchQuery);
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert(err.response?.data?.Message || "Failed to delete user");
      }
    }
  };

  const tableColumns = [
    {
      header: "Name",
      accessor: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone",
      accessor: "phoneNo",
    },
    {
      header: "Area",
      accessor: (row) => row.area?.name || "N/A",
    },
    {
      header: "Role",
      accessor: (row) => row.role?.name || "N/A",
    },
    {
      header: "Status",
      accessor: (row) => (row.isActive ? "Active" : "Inactive"),
    },
  ];

  const actions = [
    { label: "View", onClick: handleView, variant: "info" },
    { label: "Edit", onClick: handleEdit, variant: "warning" },
    { label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Manage Users</h3>
        <button className="btn btn-primary" onClick={handleAddUser}>
          Add New User
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search users by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2 text-muted">Total Users: {totalUsers}</div>

          <CommonTable
            columns={tableColumns}
            data={users}
            actions={actions}
            rowKey="_id"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ),
                )}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <AddUser
        show={showAddUser}
        onClose={handleCloseAddUser}
        isAdmin={true}
        onSuccess={handleAddUserSuccess}
      />
    </div>
  );
};

export default UserIndex;
