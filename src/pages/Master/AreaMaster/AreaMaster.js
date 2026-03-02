import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModalForm from "../../../components/common-components/CommonModalForm";
import {
  toastSuccess,
  toastError,
  confirmDelete,
} from "../../../utils/alertHelper";

const AreaManager = () => {
  const [areas, setAreas] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    state: "",
    city: "",
  });
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

  // 🔹 Fetch Countries
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

  // 🔹 Fetch Cities
  const fetchCities = async () => {
    try {
      const res = await axiosInstance.get("/cities");
      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const citiesData = payload.data ?? payload.cities ?? [];

      if (status === 1) {
        setCities(citiesData);
      } else {
        setCities([]);
        toastError(
          payload.message || payload.Message || "Failed to fetch cities",
        );
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch cities",
      );
    }
  };

  // 🔹 Fetch Areas (with pagination and search)
  const fetchAreas = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/areas", {
        params: {
          page,
          limit,
          search,
        },
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;
      const areasData = payload.data ?? payload.areas ?? [];

      if (status !== 1) {
        toastError(
          payload.message || payload.Message || "Failed to fetch areas",
        );
        setAreas([]);
        return;
      }

      const mappedAreas = areasData.map((area) => ({
        _id: area._id,
        name: area.name,
        areaname: area.name,
        country: area.country,
        countryname: area.country?.name || "",
        state: area.state,
        statename: area.state?.name || "",
        city: area.city,
        cityname: area.city?.name || "",
      }));

      setAreas(mappedAreas);
      setTotalPages(payload.totalPages || 1);
      setTotalCount(payload.totalCount || 0);
    } catch (err) {
      console.error("Error fetching areas:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to fetch areas",
      );
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lookup data on mount
  useEffect(() => {
    fetchCountries();
    fetchStates();
    fetchCities();
  }, []);

  // Fetch areas when page or search changes
  useEffect(() => {
    fetchAreas(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  /**
   * Validate form data
   */
  const validateForm = () => {
    let temp = {};
    if (!formData.name || formData.name.trim() === "") {
      temp.name = "Area name is required";
    }
    if (!formData.country) {
      temp.country = "Country is required";
    }
    if (!formData.state) {
      temp.state = "State is required";
    }
    if (!formData.city) {
      temp.city = "City is required";
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleChange = (updatedData) => {
    // Reset dependent fields when parent changes
    if (updatedData.country !== formData.country) {
      updatedData = { ...updatedData, state: "", city: "" };
    } else if (updatedData.state !== formData.state) {
      updatedData = { ...updatedData, city: "" };
    }
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
      if (updatedData.state) {
        delete newErrors.state;
      }
      if (updatedData.city) {
        delete newErrors.city;
      }
      setErrors(newErrors);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", country: "", state: "", city: "" });
    setErrors({});
    setSelectedArea(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditClick = (area) => {
    setSelectedArea(area);
    setFormData({
      name: area.name,
      country: area.country?._id || area.country,
      state: area.state?._id || area.state,
      city: area.city?._id || area.city,
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
      const res = await axiosInstance.post("/areas", {
        name: formData.name.trim(),
        country: formData.country,
        state: formData.state,
        city: formData.city,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "Area added successfully",
        );
        handleCloseModal();
        fetchAreas(1, debouncedSearchQuery);
      } else {
        toastError(payload.message || payload.Message || "Failed to add area");
      }
    } catch (err) {
      console.error("Error adding area:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to add area",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/areas/${selectedArea._id}`, {
        name: formData.name.trim(),
        country: formData.country,
        state: formData.state,
        city: formData.city,
      });

      const payload = res.data || {};
      const status = payload.status ?? payload.Status;

      if (status === 1) {
        toastSuccess(
          payload.message || payload.Message || "Area updated successfully",
        );
        handleCloseModal();
        fetchAreas(1, debouncedSearchQuery);
      } else {
        toastError(
          payload.message || payload.Message || "Failed to update area",
        );
      }
    } catch (err) {
      console.error("Error updating area:", err);
      toastError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to update area",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Delete Area
   */
  const handleDelete = async (row) => {
    const result = await confirmDelete(
      `Are you sure you want to delete "${row.name}"?`,
    );

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.delete(`/areas/${row._id}`);

        const payload = res.data || {};
        const status = payload.status ?? payload.Status;

        if (status === 1) {
          toastSuccess(
            payload.message || payload.Message || "Area deleted successfully",
          );
          fetchAreas(1, debouncedSearchQuery);
        } else {
          toastError(
            payload.message || payload.Message || "Failed to delete area",
          );
        }
      } catch (err) {
        console.error("Error deleting area:", err);
        toastError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete area",
        );
      }
    }
  };

  const countryOptions = countries.map((country) => ({
    value: country._id,
    label: country.name || country.countryname,
  }));

  /**
   * Filter states by selected country
   */
  const filteredStates = states.filter((state) => {
    const stateCountryId = state.country?._id || state.country;
    return String(stateCountryId) === String(formData.country);
  });

  /**
   * Prepare state options for select dropdown
   */
  const stateOptions = filteredStates.map((state) => ({
    value: state._id,
    label: state.name || state.statename,
  }));

  /**
   * Filter cities by selected state
   */
  const filteredCities = cities.filter((city) => {
    const cityStateId = city.state?._id || city.state;
    return String(cityStateId) === String(formData.state);
  });

  const cityOptions = filteredCities.map((city) => ({
    value: city._id,
    label: city.name || city.cityname,
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
      label: "City",
      name: "city",
      type: "select",
      required: true,
      options: cityOptions,
      disabled: !formData.state,
    },
    {
      label: "Area Name",
      name: "name",
      type: "text",
      required: true,
      placeholder: "Enter area name",
    },
  ];

  /**
   * Table columns configuration
   */
  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
    { label: "Area Name", key: "areaname" },
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
      {/* Header with Search */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Area Management</h3>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search areas (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
            title="Area List"
            addLabel="+ Add Area"
            columns={columns}
            data={areas}
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
              <span className="ms-3 text-muted">Total: {totalCount} areas</span>
            </div>
          )}
        </>
      )}

      {/* Add Area Modal */}
      <CommonModalForm
        visible={showAddModal}
        title="Add New Area"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleAddSubmit}
        submitLabel={submitting ? "Adding..." : "Add Area"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country", "state", "city"]}
      />

      {/* Edit Area Modal */}
      <CommonModalForm
        visible={showEditModal}
        title="Edit Area"
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onCancel={handleCloseModal}
        onSubmit={handleEditSubmit}
        submitLabel={submitting ? "Updating..." : "Update Area"}
        cancelLabel="Cancel"
        errors={errors}
        requiredFields={["name", "country", "state", "city"]}
      />
    </div>
  );
};

export default AreaManager;
