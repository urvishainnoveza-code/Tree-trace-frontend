import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModalForm from "../../../components/common-components/CommonModalForm";
import {
  toastSuccess,
  toastError,
  confirmDelete,
} from "../../../utils/alertHelper";

const CountryMaster = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const limit = parseInt(process.env.REACT_APP_PAGE_LIMIT || 10);

  const fetchCountries = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
      };

      const res = await axiosInstance.get("/countries", { params });
      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const data = payload.data ?? payload.countries ?? [];
      const count = payload.totalCount ?? payload.TotalCount ?? 0;

      if (status === 1) {
        setCountries(data || []);
        setTotalCount(count || 0);
        setTotalPages(payload.totalPages || 1);
        setCurrentPage(page);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to fetch countries",
        );
      }
    } catch (err) {
      console.error("Fetch countries error:", err);
      toastError(err.response?.data?.Message || "Failed to fetch countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // 🔹 Fetch Countries (Controlled by state changes)
  useEffect(() => {
    fetchCountries(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Country name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setErrors({});
    setSelectedCountry(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditClick = (country) => {
    setSelectedCountry(country);
    setFormData({ name: country.name || "" });
    setErrors({});
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChange = (updatedData) => {
    setFormData(updatedData);
    if (errors.name && updatedData.name?.trim()) {
      setErrors({});
    }
  };

  const formFields = [
    {
      label: "Country Name",
      name: "name",
      type: "text",
      required: true,
      placeholder: "Enter country name",
    },
  ];

  const handleAddSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/countries", {
        name: formData.name.trim(),
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "Country added successfully",
        );
        handleCloseModal();
        fetchCountries(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to add country",
        );
      }
    } catch (err) {
      console.error("Add country error:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to add country",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || !selectedCountry?._id) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/countries/${selectedCountry._id}`, {
        name: formData.name.trim(),
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "Country updated successfully",
        );
        handleCloseModal();
        fetchCountries(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to update country",
        );
      }
    } catch (err) {
      console.error("Edit country error:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to update country",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (country) => {
    const result = await confirmDelete(
      `Are you sure you want to delete "${country.name}"?`,
    );

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.delete(`/countries/${country._id}`);
        const payload = res.data || {};
        const status = payload.status ?? payload.Status;

        if (status === 1) {
          toastSuccess(
            payload.message ||
              payload.Message ||
              "Country deleted successfully",
          );
          fetchCountries(1, debouncedSearchQuery);
        } else {
          toastError(
            payload.message || payload.Message || "Failed to delete country",
          );
        }
      } catch (err) {
        console.error("Delete country error:", err);
        toastError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete country",
        );
      }
    }
  };

  const columns = [
    {
      label: "Country Name",
      key: "name",
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Country Management</h3>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search countries (min 3 chars)..."
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
            title="Country List"
            addLabel="+ Add Country"
            columns={columns}
            data={countries}
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
                Total: {totalCount} countries
              </span>
            </div>
          )}
        </>
      )}

      <CommonModalForm
        visible={showAddModal}
        title="Add New Country"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleAddSubmit}
        submitLabel={submitting ? "Adding..." : "Add Country"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name"]}
      />

      <CommonModalForm
        visible={showEditModal}
        title="Edit Country"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleEditSubmit}
        submitLabel={submitting ? "Updating..." : "Update Country"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name"]}
      />
    </div>
  );
};
export default CountryMaster;
