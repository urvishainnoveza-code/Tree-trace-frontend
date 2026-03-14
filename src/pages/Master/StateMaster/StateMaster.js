import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModalForm from "../../../components/common-components/CommonModalForm";
import "../../../components/common-components/common.css";
import {
  toastSuccess,
  toastError,
  confirmDelete,
} from "../../../utils/alertHelper";
const StateManager = () => {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState({ name: "", country: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const limit = parseInt(process.env.REACT_APP_PAGE_LIMIT || 10);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  //Fetch Countries
  const fetchCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const countriesData = payload.data ?? payload.countries ?? [];

      if (status === 1) {
        setCountries(countriesData);
      } else {
        setCountries([]);
        toastError(
          payload.message || payload.Message || "Failed to fetch countries",
        );
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch countries",
      );
    }
  };

  // 🔹 Fetch States (can be called anytime)
  const fetchStates = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/states", {
        params: {
          page,
          limit,
          search,
        },
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const statesData = payload.data ?? payload.states ?? [];

      if (status !== 1) {
        toastError(
          payload.message || payload.Message || "Failed to fetch states",
        );
        setStates([]);
        return;
      }

      const mappedStates = statesData.map((state) => ({
        _id: state._id,
        name: state.name,
        statename: state.name,
        country: state.country,
        countryname: state.country?.name || "",
      }));

      setStates(mappedStates);
      setTotalPages(payload.totalPages || 1);
      setTotalCount(payload.totalCount || 0);
    } catch (err) {
      console.error("Error fetching states:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch states",
      );
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  //  Fetch Countries
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch States on page/search change
  useEffect(() => {
    fetchStates(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  const validateForm = () => {
    let temp = {};
    if (!formData.name || formData.name.trim() === "") {
      temp.name = "State name is required";
    }
    if (!formData.country) {
      temp.country = "Country is required";
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleChange = (updatedData) => {
    setFormData(updatedData);
    // Clear errors when user starts fixing them
    if (Object.keys(errors).length > 0) {
      const newErrors = { ...errors };
      if (updatedData.name && updatedData.name.trim()) {
        delete newErrors.name;
      }
      if (updatedData.country) {
        delete newErrors.country;
      }
      setErrors(newErrors);
    }
  };

  /**
   * Reset form and errors
   */
  const resetForm = () => {
    setFormData({ name: "", country: "" });
    setErrors({});
    setSelectedState(null);
  };

  /**
   * Open Add Modal
   */
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  /**
   * Open Edit Modal
   */
  const handleEditClick = (state) => {
    setSelectedState(state);
    setFormData({
      name: state.name,
      country: state.country?._id || state.country,
    });
    setErrors({});
    setShowEditModal(true);
  };

  /**
   * Close modals
   */
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  /**
   * Handle Add State Submit
   */
  const handleAddSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/states", {
        name: formData.name.trim(),
        country: formData.country,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "State added successfully",
        );
        handleCloseModal();
        // ✅ Immediately fetch updated data
        fetchStates(1, debouncedSearchQuery);
      } else {
        toastError(payload.message || payload.Message || "Failed to add state");
      }
    } catch (err) {
      console.error("Error adding state:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to add state",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Edit State Submit
   */
  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/states/${selectedState._id}`, {
        name: formData.name.trim(),
        country: formData.country,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "State updated successfully",
        );
        handleCloseModal();
        // ✅ Immediately fetch updated data
        fetchStates(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to update state",
        );
      }
    } catch (err) {
      console.error("Error updating state:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to update state",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Delete State
   */
  const handleDelete = async (row) => {
    const result = await confirmDelete(
      `Are you sure you want to delete "${row.name}"?`,
    );

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.delete(`/states/${row._id}`);

        const payload = res.data || {};
        const status = payload.status ?? payload.Status;

        if (status === 1) {
          toastSuccess(
            payload.message || payload.Message || "State deleted successfully",
          );
          // ✅ Immediately fetch updated data
          fetchStates(1, debouncedSearchQuery);
        } else {
          toastError(
            payload.message || payload.Message || "Failed to delete state",
          );
        }
      } catch (err) {
        console.error("Error deleting state:", err);
        toastError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete state",
        );
      }
    }
  };

  /**
   * Prepare country options for select dropdown
   */
  const countryOptions = countries.map((country) => ({
    value: country._id,
    label: country.name || country.countryname,
  }));

  /**
   * Form fields configuration
   */
  const formFields = [
    {
      label: "Country",
      name: "country",
      type: "select",
      required: true,
      options: countryOptions,
      className: "common-index-font14",
    },
    {
      label: "State Name",
      name: "name",
      type: "text",
      required: true,
      placeholder: "Enter state name",
      className: "common-index-font14",
    },
  ];

  /**
   * Table columns configuration
   */
  const columns = [
    { label: "Country Name", key: "countryname" ,className: "common-index-font14" },
    { label: "State Name", key: "statename" ,className: "common-index-font14" },
  ];

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      {/* Header with Add button and Search */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0 commonindex-26">State Management</h3>
          <button
            className="btn btn-success add-user-btn common-index-font14"
            onClick={handleAddClick}
          >
            + Add State
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2">
          <input
            type="text"
            className="form-control common-search-input common-index-font14"
            placeholder="Search states (min 3 chars)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <CommonTable
            title="State List"
            addLabel="+ Add State"
            columns={columns}
            data={states}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />

          {/* Pagination */}
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
                Total: {totalCount} states
              </span>
            </div>
          )}
        </>
      )}

      <CommonModalForm
        visible={showAddModal}
        title="Add New State"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleAddSubmit}
        submitLabel={submitting ? "Adding..." : "Add State"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country"]}
      />

      <CommonModalForm
        visible={showEditModal}
        title="Edit State"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleEditSubmit}
        submitLabel={submitting ? "Updating..." : "Update State"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country"]}
      />
    </div>
  );
};

export default StateManager;
