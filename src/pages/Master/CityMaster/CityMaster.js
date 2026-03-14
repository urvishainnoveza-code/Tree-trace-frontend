import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModalForm from "../../../components/common-components/CommonModalForm";
import {
  toastSuccess,
  toastError,
  confirmDelete,
} from "../../../utils/alertHelper";

const CityManager = () => {
  // State Management
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    state: "",
  });
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

  //fetch countries
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

  // 🔹 Fetch States
  const fetchStates = async () => {
    try {
      const res = await axiosInstance.get("/states");
      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const statesData = payload.data ?? payload.states ?? [];

      if (status === 1) {
        setStates(statesData);
      } else {
        setStates([]);
        toastError(
          payload.message || payload.Message || "Failed to fetch states",
        );
      }
    } catch (err) {
      console.error("Error fetching states:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch states",
      );
    }
  };

  const fetchCities = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/cities", {
        params: {
          page,
          limit,
          search,
        },
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const citiesData = payload.data ?? payload.cities ?? [];

      if (status !== 1) {
        toastError(
          payload.message || payload.Message || "Failed to fetch cities",
        );
        setCities([]);
        return;
      }

      // Map the data to match the table structure
      const mappedCities = citiesData.map((city) => ({
        _id: city._id,
        name: city.name,
        cityname: city.name,
        country: city.country,
        countryname: city.country?.name || "",
        state: city.state,
        statename: city.state?.name || "",
      }));

      setCities(mappedCities);
      setTotalPages(payload.totalPages || 1);
      setTotalCount(payload.totalCount || 0);
    } catch (err) {
      console.error("Error fetching cities:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch cities",
      );
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries and states on mount
  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  // Fetch cities when page or search changes
  useEffect(() => {
    fetchCities(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  /**
   * Validate form data
   */
  const validateForm = () => {
    let temp = {};
    if (!formData.name || formData.name.trim() === "") {
      temp.name = "City name is required";
    }
    if (!formData.country) {
      temp.country = "Country is required";
    }
    if (!formData.state) {
      temp.state = "State is required";
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  //form input change
  const handleChange = (updatedData) => {
    if (updatedData.country !== formData.country) {
      updatedData = { ...updatedData, state: "" };
    }
    setFormData(updatedData);
    if (Object.keys(errors).length > 0) {
      const newErrors = { ...errors };
      if (updatedData.name && updatedData.name.trim()) {
        delete newErrors.name;
      }
      if (updatedData.country) {
        delete newErrors.country;
      }
      if (updatedData.state) {
        delete newErrors.state;
      }
      setErrors(newErrors);
    }
  };

  /**
   * Reset form and errors
   */
  const resetForm = () => {
    setFormData({ name: "", country: "", state: "" });
    setErrors({});
    setSelectedCity(null);
  };

  /**
   * Open Add Modal
   */
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditClick = (city) => {
    setSelectedCity(city);
    setFormData({
      name: city.name,
      country: city.country?._id || city.country,
      state: city.state?._id || city.state,
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
      const res = await axiosInstance.post("/cities", {
        name: formData.name.trim(),
        country: formData.country,
        state: formData.state,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "City added successfully",
        );
        handleCloseModal();
        // ✅ Immediately fetch updated data
        fetchCities(1, debouncedSearchQuery);
      } else {
        toastError(payload.message || payload.Message || "Failed to add city");
      }
    } catch (err) {
      console.error("Error adding city:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to add city",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/cities/${selectedCity._id}`, {
        name: formData.name.trim(),
        country: formData.country,
        state: formData.state,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "City updated successfully",
        );
        handleCloseModal();
        // ✅ Immediately fetch updated data
        fetchCities(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to update city",
        );
      }
    } catch (err) {
      console.error("Error updating city:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to update city",
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
        const res = await axiosInstance.delete(`/cities/${row._id}`);

        const payload = res.data || {};
        const status = payload.status ?? payload.Status;

        if (status === 1) {
          toastSuccess(
            payload.message || payload.Message || "City deleted successfully",
          );
          fetchCities(1, debouncedSearchQuery);
        } else {
          toastError(
            payload.message || payload.Message || "Failed to delete city",
          );
        }
      } catch (err) {
        console.error("Error deleting city:", err);
        toastError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete city",
        );
      }
    }
  };

  const countryOptions = countries.map((country) => ({
    value: country._id,
    label: country.name || country.countryname,
  }));

  const filteredStates = states.filter((state) => {
    const stateCountryId = state.country?._id || state.country;
    return String(stateCountryId) === String(formData.country);
  });

  const stateOptions = filteredStates.map((state) => ({
    value: state._id,
    label: state.name || state.statename,
  }));

  const formFields = [
    {
      label: "Country",
      name: "country",
      type: "select",
      required: true,
      options: countryOptions,
    },
    {
      label: "State",
      name: "state",
      type: "select",
      required: true,
      options: stateOptions,
      disabled: !formData.country,
    },
    {
      label: "City Name",
      name: "name",
      type: "text",
      required: true,
      placeholder: "Enter city name",
    },
  ];

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0 commonindex-26">City Management</h3>
          <button
            className="btn btn-success add-user-btn common-index-font14"
            onClick={handleAddClick}
          >
            + Add City
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2">
          <input
            type="text"
            className="form-control common-search-input common-index-font14"
            placeholder="Search cities (min 3 chars)..."
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
            title="City List"
            addLabel="+ Add City"
            columns={columns}
            data={cities}
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
                Total: {totalCount} cities
              </span>
            </div>
          )}
        </>
      )}

      {/* Add City Modal */}
      <CommonModalForm
        visible={showAddModal}
        title="Add New City"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleAddSubmit}
        submitLabel={submitting ? "Adding..." : "Add City"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country", "state"]}
      />

      {/* Edit City Modal */}
      <CommonModalForm
        visible={showEditModal}
        title="Edit City"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleEditSubmit}
        submitLabel={submitting ? "Updating..." : "Update City"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country", "state"]}
      />
    </div>
  );
};

export default CityManager;
