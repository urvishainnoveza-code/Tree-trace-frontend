import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { getUserType } from "../../../utils/auth";
import { toastSuccess, toastError } from "../../../utils/alertHelper";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";

const AssignmentIndex = () => {
  const navigate = useNavigate();
  const userType = getUserType();
  const isSuperAdmin = userType === "superAdmin";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Removed unused totalRecords state
  const limit = parseInt(process.env.REACT_APP_PAGE_LIMIT || 10);

  // Filter states
  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
    treeId: "",
  });
  const [filterCountries, setFilterCountries] = useState([]);
  const [filterStates, setFilterStates] = useState([]);
  const [filterCities, setFilterCities] = useState([]);
  const [filterAreas, setFilterAreas] = useState([]);
  const [filterTrees, setFilterTrees] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch assignments with filters
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit,
          search: debouncedSearchQuery,
        };

        // Add filter params
        if (filters.countryId) params.country = filters.countryId;
        if (filters.stateId) params.state = filters.stateId;
        if (filters.cityId) params.city = filters.cityId;
        if (filters.areaId) params.area = filters.areaId;
        if (filters.treeId) params.treeName = filters.treeId;

        const res = await axiosInstance.get("/assign", { params });

        if (res.data.Status === 1) {
          setAssignments(res.data.data || res.data.Data || []);
          setTotalPages(res.data.TotalPages || res.data.totalPages || 1);
        } else {
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
  }, [currentPage, debouncedSearchQuery, filters, limit]);

  // Fetch filter dropdowns
  const fetchFilterCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      const payload = res.data || {};
      setFilterCountries(payload.data || payload.countries || []);
    } catch (err) {
      console.error("Filter country fetch error:", err);
    }
  };

  const fetchFilterStates = async () => {
    try {
      const res = await axiosInstance.get("/states");
      const payload = res.data || {};
      setFilterStates(payload.data || payload.states || []);
    } catch (err) {
      console.error("Filter state fetch error:", err);
      setFilterStates([]);
    }
  };

  const fetchFilterCities = async () => {
    try {
      const res = await axiosInstance.get("/cities");
      const payload = res.data || {};
      setFilterCities(payload.data || payload.cities || []);
    } catch (err) {
      console.error("Filter city fetch error:", err);
      setFilterCities([]);
    }
  };

  const fetchFilterAreas = async () => {
    try {
      const res = await axiosInstance.get("/areas");
      const payload = res.data || {};
      setFilterAreas(payload.data || payload.areas || []);
    } catch (err) {
      console.error("Filter area fetch error:", err);
      setFilterAreas([]);
    }
  };

  const fetchFilterTrees = async () => {
    try {
      const res = await axiosInstance.get("/treename");
      const payload = res.data || {};
      setFilterTrees(payload.Data || payload.data || payload.treeName || []);
    } catch (err) {
      console.error("Filter tree fetch error:", err);
      setFilterTrees([]);
    }
  };

  // Load all filter dropdowns on mount
  useEffect(() => {
    fetchFilterCountries();
    fetchFilterStates();
    fetchFilterCities();
    fetchFilterAreas();
    fetchFilterTrees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      countryId: "",
      stateId: "",
      cityId: "",
      areaId: "",
      treeId: "",
    });
    setCurrentPage(1);
  };

  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm("Cancel this assignment?")) return;

    try {
      const res = await axiosInstance.put(`/assign/${assignmentId}/cancel`);
      if (res.data.Status === 1) {
        toastSuccess(res.data.Message || "Assignment cancelled");
        setAssignments((prev) =>
          prev.map((item) =>
            item._id === assignmentId ? { ...item, status: "cancelled" } : item,
          ),
        );
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
    { label: "Country", key: "country.name" },
    { label: "State", key: "state.name" },
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
      {isSuperAdmin && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="commonindex-24">Tree Assignments</h3>
            <button
              className="btn btn-success add-btn common-index-font14"
              onClick={() => navigate("/manage-plantation/assign")}
            >
              + Assign Trees
            </button>
          </div>
          <div className="d-flex align-items-center gap-2 mb-3 flex-nowrap">
            <div className="d-flex align-items-center gap-2 flex-nowrap w-100">
              <input
                type="text"
                className="form-control common-search-input common-index-font14"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 220, minWidth: 180, fontSize: 14 }}
              />
              <CommonFilter
                filters={filters}
                dropdowns={{
                  countryId: filterCountries,
                  stateId: filterStates,
                  cityId: filterCities,
                  areaId: filterAreas,
                  treeId: filterTrees,
                }}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                filtersToShow={[
                  "countryId",
                  "stateId",
                  "cityId",
                  "areaId",
                  "treeId",
                ]}
                inputClassName="common-filter-select common-index-font14"
                selectClassName="common-filter-select common-index-font14"
                buttonClassName="common-filter-btn common-index-font14"
              />
            </div>
          </div>
        </>
      )}

      {/* Table */}
      <CommonTable
        title="Assignment List"
        addLabel="+ Assign Trees"
        columns={tableColumns}
        data={assignments}
        loading={loading}
        actions={getActions}
        onAdd={() => navigate("/manage-plantation/assign")}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          limit,
        }}
      />
    </div>
  );
};

export default AssignmentIndex;
