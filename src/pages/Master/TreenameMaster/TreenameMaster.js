import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModalForm from "../../../components/common-components/CommonModalForm";
import {
  toastSuccess,
  toastError,
  confirmDelete,
} from "../../../utils/alertHelper";

const TreenameManager = () => {
  // State Management
  const [treenames, setTreenames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTreename, setSelectedTreename] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form States
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const limit = parseInt(process.env.REACT_APP_PAGE_LIMIT || 10);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Fetch treenames with pagination and search
   */
  const fetchTreenames = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/treename", {
        params: {
          page,
          limit,
          search,
        },
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const treenamesData = payload.data ?? payload.Data ?? [];
      const pagination = payload.pagination ?? payload.Pagination;

      if (status !== 1) {
        toastError(
          payload.message || payload.Message || "Failed to fetch tree names",
        );
        setTreenames([]);
        return;
      }

      // Map the data to match the table structure
      const mappedTreenames = treenamesData.map((treename) => ({
        _id: treename._id,
        name: treename.name,
        treename: treename.name, // For table display
      }));

      setTreenames(mappedTreenames);
      setTotalPages(pagination?.totalPages || 1);
      setTotalCount(pagination?.totalCount || 0);
    } catch (err) {
      console.error("Error fetching tree names:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch tree names",
      );
      setTreenames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreenames(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  const validateForm = () => {
    let temp = {};
    if (!formData.name || formData.name.trim() === "") {
      temp.name = "Tree name is required";
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (updatedFormData) => {
    setFormData(updatedFormData);
    // Clear errors for changed fields
    setErrors({});
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setErrors({});
    setSelectedTreename(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };
  const handleEditClick = (treename) => {
    setSelectedTreename(treename);
    setFormData({
      name: treename.name,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/treename", {
        name: formData.name.trim(),
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "Tree name added successfully",
        );
        handleCloseModal();
        fetchTreenames(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to add tree name",
        );
      }
    } catch (err) {
      console.error("Error adding tree name:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to add tree name",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/treename/${selectedTreename._id}`, {
        name: formData.name.trim(),
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message ||
            payload.Message ||
            "Tree name updated successfully",
        );
        handleCloseModal();
        fetchTreenames(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to update tree name",
        );
      }
    } catch (err) {
      console.error("Error updating tree name:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to update tree name",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await confirmDelete(
      `Are you sure you want to delete "${row.name}"?`,
    );

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.delete(`/treename/${row._id}`);

        const payload = res.data || {};
        const status = payload.status ?? payload.Status;

        if (status === 1) {
          toastSuccess(
            payload.message ||
              payload.Message ||
              "Tree name deleted successfully",
          );
          fetchTreenames(1, debouncedSearchQuery);
        } else {
          toastError(
            payload.message || payload.Message || "Failed to delete tree name",
          );
        }
      } catch (err) {
        console.error("Error deleting tree name:", err);
        toastError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete tree name",
        );
      }
    }
  };
  const formFields = [
    {
      label: "Tree Name",
      name: "name",
      type: "text",
      required: true,
      placeholder: "Enter tree name",
    },
  ];

  const columns = [{ label: "Tree Name", key: "treename" }];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Tree Name Management</h3>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search tree names (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <CommonTable
            title="Tree Name List"
            addLabel="+ Add Tree Name"
            columns={columns}
            data={treenames}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3">
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
              <span className="ms-3 text-muted">
                Total: {totalCount} tree names
              </span>
            </div>
          )}
        </>
      )}

      <CommonModalForm
        visible={showAddModal}
        title="Add New Tree Name"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleAddSubmit}
        submitLabel={submitting ? "Adding..." : "Add Tree Name"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name"]}
      />

      <CommonModalForm
        visible={showEditModal}
        title="Edit Tree Name"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleEditSubmit}
        submitLabel={submitting ? "Updating..." : "Update Tree Name"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name"]}
      />
    </div>
  );
};

export default TreenameManager;
