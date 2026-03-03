import React, { useEffect, useState } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddTreeDetail from "./AddTreeDetail";
import axiosInstance from "../../../utils/axiosInstance";
import { getUser } from "../../../utils/auth";
import { toastError } from "../../../utils/alertHelper";
import "../../../components/common-components/common.css";

const ViewTask = () => {
  const [trees, setTrees] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddTreeDetail, setShowAddTreeDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    areaId: [],
  });

  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      const currentUser = getUser();
      const userId = currentUser?._id;

      if (!userId) {
        setTrees([]);
        setAllTrees([]);
        setDropdowns({ areaId: [] });
        return;
      }

      const groupsRes = await axiosInstance.get("/groups");
      const groupsList =
        groupsRes.data?.data ||
        groupsRes.data?.Data ||
        groupsRes.data?.groups ||
        [];

      const getGroupUsers = (group) => {
        if (Array.isArray(group?.users)) return group.users;
        return [];
      };

      const userGroupIds = new Set(
        groupsList
          .filter((group) =>
            getGroupUsers(group).some(
              (user) =>
                (typeof user === "string" && user === userId) ||
                user?._id === userId,
            ),
          )
          .map((group) => String(group._id)),
      );

      if (userGroupIds.size === 0) {
        setTrees([]);
        setAllTrees([]);
        setDropdowns({ areaId: [] });
        return;
      }

      const assignmentsRes = await axiosInstance.get("/assign", {
        params: { page: 1, limit: 500 },
      });
      const assignments =
        assignmentsRes.data?.data || assignmentsRes.data?.Data || [];

      const userAssignments = assignments.filter((assignment) => {
        const groupId =
          typeof assignment.group === "string"
            ? assignment.group
            : assignment.group?._id;
        return groupId && userGroupIds.has(String(groupId));
      });

      setAllTrees(userAssignments);
      setTrees(
        filters.areaId
          ? userAssignments.filter((task) => task.area?._id === filters.areaId)
          : userAssignments,
      );

      const uniqueAreas = [
        ...new Map(
          userAssignments
            .filter((task) => task?.area?._id)
            .map((task) => [
              task.area._id,
              { _id: task.area._id, name: task.area.name || "N/A" },
            ]),
        ).values(),
      ];

      setDropdowns({ areaId: uniqueAreas });
    } catch (error) {
      toastError(error.response?.data?.Message || "Failed to fetch user tasks");
      setTrees([]);
      setAllTrees([]);
      setDropdowns({ areaId: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------
  // Apply Filter
  // ---------------------------------
  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = [...allTrees];

    if (selectedFilters.areaId) {
      filtered = filtered.filter((t) => t.area?._id === selectedFilters.areaId);
    }

    setTrees(filtered);
  };

  // ---------------------------------
  // Clear Filter
  // ---------------------------------
  const handleClearFilters = () => {
    setFilters({ areaId: "" });
    setTrees(allTrees);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Tree List</h2>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["areaId"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Table */}
      <CommonTable
        columns={[
          { label: "Tree Name", key: "treeName.name" },
          { label: "Tree Count", key: "count" },
          {
            label: "Planted Count",
            key: "totalPlantedCount",
            render: (item) => {
              const planted = item.totalPlantedCount || 0;
              const total = item.count || 0;
              return `${planted} / ${total}`;
            },
          },
          { label: "State", key: "state.name" },
          { label: "City", key: "city.name" },
          { label: "Area", key: "area.name" },
          { label: "Group", key: "group.name" },
          {
            label: "Status",
            key: "status",
            render: (item) => {
              const statusColors = {
                assigned: "warning",
                completed: "success",
                cancelled: "danger",
              };
              const statusLabels = {
                assigned: "Assigned",
                completed: "Completed",
                cancelled: "Cancelled",
              };
              return (
                <span
                  className={`badge bg-${statusColors[item.status] || "secondary"}`}
                >
                  {statusLabels[item.status] || item.status}
                </span>
              );
            },
          },
          {
            label: "Action",
            key: "action",
            render: (item) => {
              const remaining =
                (item.count || 0) - (item.totalPlantedCount || 0);
              const isCompleted = item.status === "completed" || remaining <= 0;

              return (
                <button
                  className={`btn btn-sm ${isCompleted ? "btn-secondary" : "btn-success"}`}
                  onClick={() => {
                    setSelectedTask(item);
                    setShowAddTreeDetail(true);
                  }}
                  disabled={isCompleted}
                  title={
                    isCompleted
                      ? "All trees planted"
                      : `${remaining} trees remaining`
                  }
                >
                  {isCompleted ? "Completed" : "Plant"}
                </button>
              );
            },
          },
        ]}
        data={trees}
        loading={loading}
      />

      <AddTreeDetail
        show={showAddTreeDetail}
        initialData={
          selectedTask
            ? {
                assignmentId: selectedTask._id,
                treename: selectedTask?.treeName?.name || "",
                country: selectedTask?.country?.name || "",
                state: selectedTask?.state?.name || "",
                city: selectedTask?.city?.name || "",
                area: selectedTask?.area?.name || "",
              }
            : null
        }
        onClose={() => {
          setShowAddTreeDetail(false);
          setSelectedTask(null);
        }}
        onSaved={(newPlantation) => {
          setShowAddTreeDetail(false);
          setSelectedTask(null);
          fetchUserTasks();
        }}
      />
    </div>
  );
};

export default ViewTask;
