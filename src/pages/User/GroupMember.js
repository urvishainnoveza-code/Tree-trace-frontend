import React, { useState, useEffect } from "react";
import CommonTable from "../../components/common-components/CommonTable";
import axiosInstance from "../../utils/axiosInstance";
import { toastError } from "../../utils/alertHelper";
import { getUser } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const GroupMembers = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchGroupMembers = async () => {
    setLoading(true);
    try {
      const userAreaId = currentUser?.area?._id || currentUser?.area;

      if (!userAreaId) {
        toastError("Area information not found in user profile");
        setLoading(false);
        return;
      }

      // Fetch group by area ID
      const response = await axiosInstance.get(`/groups/area/${userAreaId}`);

      if (response.data?.Status === 1) {
        const group = response.data?.group;

        if (!group) {
          toastError("No group found for your area");
          setMembers([]);
          setLoading(false);
          return;
        }

        // Extract members from the group
        const groupMembers = group.users || [];
        setGroupName(group.name || "");
        setMembers(
          groupMembers.map((user) => ({
            ...user,
            groupName: group.name,
            groupId: group._id,
          })),
        );
      } else {
        toastError(response.data?.Message || "Failed to fetch group members");
        setMembers([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toastError("No group found for your area");
      } else {
        toastError(
          error.response?.data?.Message || "Error fetching group members",
        );
      }
      console.error("Fetch Group Members Error:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      label: "Member Name",
      key: "firstName",
      render: (row) =>
        `${row.firstName || ""} ${row.lastName || ""}`.trim() || "-",
    },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    {
      label: "Country",
      key: "country",
      render: (row) => row.country?.name || "-",
    },
    {
      label: "State",
      key: "state",
      render: (row) => row.state?.name || "-",
    },
    {
      label: "City",
      key: "city",
      render: (row) => row.city?.name || "-",
    },
  ];

  const filteredMembers = React.useMemo(() => {
    if (!debouncedSearchQuery) return members;
    const query = debouncedSearchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName?.toLowerCase().includes(query) ||
        m.lastName?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query),
    );
  }, [members, debouncedSearchQuery]);

  return (
    <div className="p-4">
      <div className="mb-3">
        <h2 className="commonindex-24">
          {groupName ? `${groupName} - Group Members` : "Group Members"}
        </h2>
      </div>
      <div className="d-flex align-items-center gap-2 mb-3 flex-nowrap">
        <input
          type="text"
          className="form-control common-search-input common-index-font14"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 220, minWidth: 180, fontSize: 14 }}
        />
      </div>
      {filteredMembers.length === 0 && !loading && (
        <div className="alert alert-info">
          No group members found for your area
        </div>
      )}

      <CommonTable
        title="Member List"
        columns={columns}
        data={filteredMembers}
        loading={loading}
        onView={(row) => navigate(`/user-profile/${row._id}`)}
      />
    </div>
  );
};

export default GroupMembers;
