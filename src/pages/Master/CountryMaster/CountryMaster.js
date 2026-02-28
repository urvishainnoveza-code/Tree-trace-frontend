import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonModel from "../../../components/common-components/CommonModel";
import CommonForm from "../../../components/common-components/CommonForm";
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
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);

  const limit = parseInt(process.env.REACT_APP_PAGE_LIMIT || 10);

  const fetchCountries = useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          ...(search && { search }),
        };

        const res = await axiosInstance.get("/countries", { params });
        const { Status, countries: data, totalCount } = res.data;

        if (Status === 1) {
          setCountries(data || []);
          setTotalCount(totalCount || 0);
          setCurrentPage(page);
        } else {
          toastError("Failed to fetch countries");
        }
      } catch (err) {
        console.error("Fetch countries error:", err);
        toastError(err.response?.data?.Message || "Failed to fetch countries");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCountries(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, fetchCountries]);

  const handleOpenAddForm = () => {
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalCount / limit)) {
      setCurrentPage(page);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastError("Country name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/countries", {
        name: formData.name.trim(),
      });

      const { Status, Message } = res.data;

      if (Status === 1) {
        toastSuccess(Message || "Country added successfully");
        setCurrentPage(1);
        fetchCountries(1, debouncedSearchQuery);
        handleCloseModal();
      } else {
        toastError(Message || "Failed to add country");
      }
    } catch (err) {
      console.error("Add country error:", err);
      toastError(err.response?.data?.Message || "Failed to add country");
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
        const { Status, Message } = res.data;

        if (Status === 1) {
          toastSuccess(Message || "Country deleted successfully");
          fetchCountries(currentPage, debouncedSearchQuery);
        } else {
          toastError(Message || "Failed to delete country");
        }
      } catch (err) {
        console.error("Delete country error:", err);
        toastError(err.response?.data?.Message || "Failed to delete country");
      }
    }
  };

  const tableColumns = [
    {
      header: "Country Name",
      accessor: "name",
    },
  ];

  const actions = [
    {
      label: "Delete",
      onClick: (row) => handleDelete(row),
      variant: "danger",
    },
  ];

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4 align-items-center">
        <div className="col-auto">
          <h1 className="h3 mb-0">Country Master</h1>
        </div>
        <div className="col-auto ms-auto">
          <button
            className="btn btn-success"
            onClick={handleOpenAddForm}
            disabled={loading}
          >
            <i className="fas fa-plus me-2"></i>Add New Country
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search countries (min 3 chars)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="col-md-6 text-end">
          <small className="text-muted">
            <strong>Total:</strong> {totalCount} countr
            {totalCount !== 1 ? "ies" : "y"}
          </small>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="card-body text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading countries...</p>
          </div>
        ) : countries.length > 0 ? (
          <>
            <div className="table-responsive">
              <CommonTable
                columns={tableColumns}
                data={countries}
                actions={actions}
                rowKey="_id"
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="card-footer bg-light border-top"
                aria-label="Page navigation"
              >
                <ul className="pagination justify-content-center mb-0">
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
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
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
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
            )}
          </>
        ) : (
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No countries found</p>
          </div>
        )}
      </div>

      {/* Modal with auto buttons */}
      <CommonModel
        show={showModal}
        title="Add New Country"
        onClose={handleCloseModal}
        buttons={[
          {
            label: "Cancel",
            onClick: handleCloseModal,
            variant: "secondary",
            disabled: submitting,
          },
          {
            label: submitting ? "Adding..." : "Add Country",
            onClick: handleSubmit,
            variant: "success",
            disabled: submitting,
          },
        ]}
      >
        <form onSubmit={handleSubmit}>
          <CommonForm
            fields={formFields}
            formData={formData}
            onChange={handleFormChange}
          />
        </form>
      </CommonModel>
    </div>
  );
};

export default CountryMaster;
