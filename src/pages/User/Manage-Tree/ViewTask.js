import React, { useEffect, useState } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import axiosInstance from "../../../utils/axiosInstance";
import { getUser } from "../../../utils/auth";
import { toastError } from "../../../utils/alertHelper";
import "../../../components/common-components/common.css";

const ViewTask = () => {
  const [trees, setTrees] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    areaId: [],
  });

  useEffect(() => {
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

        setTrees(userAssignments);
        setAllTrees(userAssignments);

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
        toastError(
          error.response?.data?.Message || "Failed to fetch user tasks",
        );
        setTrees([]);
        setAllTrees([]);
        setDropdowns({ areaId: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchUserTasks();
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
        ]}
        data={trees}
        loading={loading}
      />
    </div>
  );
};

export default ViewTask;
