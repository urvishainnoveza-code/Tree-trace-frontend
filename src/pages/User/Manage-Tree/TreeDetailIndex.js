import React, { useState, useEffect } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddTreeDetail from "./AddTreeDetail";
import axiosInstance from "../../../utils/axiosInstance";
import { toastError } from "../../../utils/alertHelper";
import { getUser } from "../../../utils/auth";
import { useNavigate } from "react-router-dom";

const ViewTreeDetail = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const userType = localStorage.getItem("userType");
  const [treeDetail, setTreeDetail] = useState([]);
  const [allTreeDetail, setAllTreeDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTreeDetail, setSelectedTreeDetail] = useState(null);

  const [filters, setFilters] = useState({
    treeId: "",
    stateId: "",
    cityId: "",
    areaId: "",
    date: "",
  });

  const [dropdowns, setDropdowns] = useState({
    treeId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });

  useEffect(() => {
    fetchPlantations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toLocalDateInputValue = (dateValue) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "";
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPlantations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/plantation");
      if (response.data?.Status === 1) {
        const plantations = response.data?.Plantation || [];
        setTreeDetail(plantations);
        setAllTreeDetail(plantations);

        // Build unique dropdown options
        const uniqueTrees = [
          ...new Map(
            plantations
              .filter((p) => p.assign?.treeName?._id)
              .map((p) => [
                p.assign.treeName._id,
                { _id: p.assign.treeName._id, name: p.assign.treeName.name },
              ]),
          ).values(),
        ];

        const uniqueStates = [
          ...new Map(
            plantations
              .filter((p) => p.assign?.state?._id)
              .map((p) => [
                p.assign.state._id,
                { _id: p.assign.state._id, name: p.assign.state.name },
              ]),
          ).values(),
        ];

        const uniqueCities = [
          ...new Map(
            plantations
              .filter((p) => p.assign?.city?._id)
              .map((p) => [
                p.assign.city._id,
                { _id: p.assign.city._id, name: p.assign.city.name },
              ]),
          ).values(),
        ];

        const uniqueAreas = [
          ...new Map(
            plantations
              .filter((p) => p.assign?.area?._id)
              .map((p) => [
                p.assign.area._id,
                { _id: p.assign.area._id, name: p.assign.area.name },
              ]),
          ).values(),
        ];

        setDropdowns({
          treeId: uniqueTrees,
          stateId: uniqueStates,
          cityId: uniqueCities,
          areaId: uniqueAreas,
        });
      } else {
        toastError(response.data?.Message || "Failed to fetch plantations");
      }
    } catch (error) {
      toastError(error.response?.data?.Message || "Error fetching plantations");
      console.error("Fetch Plantations Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = [...allTreeDetail];

    if (selectedFilters.treeId) {
      filtered = filtered.filter(
        (t) => t.assign?.treeName?._id === selectedFilters.treeId,
      );
    }

    if (selectedFilters.stateId) {
      filtered = filtered.filter(
        (t) => t.assign?.state?._id === selectedFilters.stateId,
      );
    }

    if (selectedFilters.cityId) {
      filtered = filtered.filter(
        (t) => t.assign?.city?._id === selectedFilters.cityId,
      );
    }

    if (selectedFilters.areaId) {
      filtered = filtered.filter(
        (t) => t.assign?.area?._id === selectedFilters.areaId,
      );
    }
    if (selectedFilters.date) {
      filtered = filtered.filter((t) => {
        if (!t.plantationDate) return false;
        const plantationDate = toLocalDateInputValue(t.plantationDate);
        return plantationDate === selectedFilters.date;
      });
    }

    setTreeDetail(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      treeId: "",
      stateId: "",
      cityId: "",
      areaId: "",
      date: "",
    });
    setTreeDetail(allTreeDetail);
  };

  const handleEdit = (row) => {
    setSelectedTreeDetail(row);
    setShowEdit(true);
  };

  // Enhanced edit save handler for proximity fields
  const handleEditSaved = (updatedPlantation, editData) => {
    // Check if proximity fields are being edited
    const proximityFields = [
      "cage",
      "watering",
      "fertilizer",
      "fertilizerDetail",
      "images",
    ];
    const isProximityEdit = proximityFields.some(
      (field) => editData && editData[field] !== undefined,
    );
    if (isProximityEdit) {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Send edit request with location
            axiosInstance
              .put(`/plantation/${updatedPlantation._id}`, {
                ...editData,
                latitude,
                longitude,
              })
              .then(() => {
                fetchPlantations();
                toastError("Edit successful.");
              })
              .catch((error) => {
                toastError(
                  error.response?.data?.Message || "Error updating plantation",
                );
              });
          },
          (error) => {
            toastError("Location permission denied or unavailable.");
          },
        );
      } else {
        toastError("Geolocation not supported by your browser.");
      }
    } else {
      fetchPlantations();
    }
  };

  const columns = [
    { label: "Tree Name", key: "assign.treeName.name" },
    {
      label: "Planter Name",
      key: "plantedBy",
      render: (row) => {
        if (typeof row.plantedBy === "object" && row.plantedBy) {
          if (row.plantedBy.firstName && row.plantedBy.lastName) {
            return `${row.plantedBy.firstName} ${row.plantedBy.lastName}`;
          }
          if (row.plantedBy.firstName) {
            return row.plantedBy.firstName;
          }
        }

        const plantedById =
          typeof row.plantedBy === "string"
            ? row.plantedBy
            : row.plantedBy?._id;

        if (
          plantedById &&
          currentUser?._id &&
          String(plantedById) === String(currentUser._id)
        ) {
          return (
            `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
            "You"
          );
        }

        return "-";
      },
    },
    { label: "Planted Count", key: "plantedCount" },
    { label: "State", key: "assign.state.name" },
    { label: "City", key: "assign.city.name" },
    { label: "Area", key: "assign.area.name" },
    { label: "Address", key: "address" },
    {
      label: "Cage",
      key: "cage",
      render: (row) => (row.cage ? "Yes" : "No"),
    },
    {
      label: "Watering",
      key: "watering",
      render: (row) => (row.watering ? "Yes" : "No"),
    },
    {
      label: "Health",
      key: "healthStatus",
      valueMap: {
        planted: "Planted",
        growing: "Growing",
        healthy: "Healthy",
        diseased: "Diseased",
      },
    },
    { label: "Age", key: "age" },
    {
      label: "Last Watered",
      key: "lastWateredDate",
      render: (row) =>
        row.lastWateredDate
          ? new Date(row.lastWateredDate).toLocaleString()
          : "-",
    },
    {
      label: "Last Fertilizer",
      key: "lastFertilizerDate",
      render: (row) =>
        row.lastFertilizerDate
          ? new Date(row.lastFertilizerDate).toLocaleString()
          : "-",
    },
    {
      label: "Plantation Date",
      key: "plantationDate",
      render: (row) =>
        row.plantationDate
          ? new Date(row.plantationDate).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2 className="fw-bold">Tree Detail List</h2>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["treeId", "stateId", "cityId", "areaId", "date"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <CommonTable
        title="Tree Plantation List"
        columns={columns}
        data={treeDetail}
        loading={loading}
        onEdit={userType === "superAdmin" ? undefined : handleEdit}
        onView={(row) => navigate(`/tree-profile/${row._id}`)}
      />

      <AddTreeDetail
        show={showEdit}
        initialData={selectedTreeDetail}
        onClose={() => {
          setShowEdit(false);
          setSelectedTreeDetail(null);
        }}
        onSaved={handleEditSaved}
      />
    </div>
  );
};

export default ViewTreeDetail;
