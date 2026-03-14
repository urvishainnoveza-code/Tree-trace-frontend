import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { toastSuccess, toastError } from "../../../utils/alertHelper";
import CommonForm from "../../../components/common-components/CommonForm";

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    treeName: "",
    count: "",
    country: "",
    state: "",
    city: "",
    area: "",
    groupId: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [treenames, setTreenames] = useState([]);
  const [cityGroups, setCityGroups] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [groupError, setGroupError] = useState(null);
  const [multipleGroups, setMultipleGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    fetchCountries();
    fetchTreenames();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      setCountries(res.data.data || res.data.countries || []);
    } catch (err) {
      toastError("Failed to fetch countries");
    }
  };

  const fetchTreenames = async () => {
    try {
      const res = await axiosInstance.get("/treename");
      const treenamesData = res.data.data || res.data.Data || [];
      setTreenames(treenamesData);
    } catch (err) {
      toastError("Failed to fetch tree names");
      setTreenames([]);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await axiosInstance.get("/states", {
        params: { country: countryId },
      });
      setStates(res.data.data || res.data.states || []);
    } catch (err) {
      setStates([]);
    }
  };

  const fetchCities = async (countryId, stateId) => {
    try {
      const res = await axiosInstance.get("/cities", {
        params: { country: countryId, state: stateId },
      });
      setCities(res.data.data || res.data.cities || []);
    } catch (err) {
      setCities([]);
    }
  };

  const fetchAreas = async (countryId, stateId, cityId) => {
    try {
      const res = await axiosInstance.get("/areas", {
        params: { country: countryId, state: stateId, city: cityId },
      });
      setAreas(res.data.data || res.data.areas || []);
    } catch (err) {
      setAreas([]);
    }
  };

  const getGroupMemberCount = (group) => {
    if (Array.isArray(group?.users)) return group.users.length;
    if (typeof group?.memberCount === "number") return group.memberCount;
    if (typeof group?.usersCount === "number") return group.usersCount;
    if (typeof group?.userCount === "number") return group.userCount;
    return null;
  };

  const fetchGroupsByCity = async (cityId) => {
    try {
      const res = await axiosInstance.get("/groups", {
        params: { city: cityId },
      });
      const groupsList = res.data.data || res.data.groups || [];
      const filteredGroups = groupsList.filter((group) => {
        const memberCount = getGroupMemberCount(group);
        if (memberCount === null) return true;
        return memberCount > 0;
      });
      setCityGroups(filteredGroups);
    } catch (err) {
      setCityGroups([]);
    }
  };

  const fetchGroupByArea = async (areaId) => {
    setGroupError(null);
    setGroupInfo(null);
    setFormData((prev) => ({ ...prev, groupId: "" }));
    try {
      const res = await axiosInstance.get(`/groups/area/${areaId}`);
      if (res.data.Status === 1 && res.data.group) {
        if (res.data.group.users && res.data.group.users.length > 0) {
          setGroupInfo(res.data.group);
          setFormData((prev) => ({ ...prev, groupId: "" }));
        } else {
          setGroupError({
            type: "warning",
            message:
              "Selected area has no active users. Please select a user group from this city.",
          });
          setGroupInfo(null);
        }
      } else if (res.data.Status === 2) {
        // Multiple groups found
        setMultipleGroups(res.data.Groups || []);
        setShowGroupModal(true);
      } else {
        setGroupError({
          type: "error",
          message:
            "No group found for this area. Please select a user group from this city.",
        });
        setGroupInfo(null);
      }
    } catch (err) {
      setGroupError({
        type: "error",
        message:
          err.response?.data?.Message || "Failed to fetch group information",
      });
      setGroupInfo(null);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
        area: "",
        groupId: "",
      }));
      setStates([]);
      setCities([]);
      setAreas([]);
      setGroupInfo(null);
      setGroupError(null);
      if (value) await fetchStates(value);
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, city: "", area: "", groupId: "" }));
      setCities([]);
      setAreas([]);
      setGroupInfo(null);
      setGroupError(null);
      if (value) await fetchCities(formData.country, value);
    }

    if (name === "city") {
      setFormData((prev) => ({ ...prev, area: "", groupId: "" }));
      setAreas([]);
      setGroupInfo(null);
      setGroupError(null);
      setCityGroups([]);
      if (value) {
        await fetchAreas(formData.country, formData.state, value);
        await fetchGroupsByCity(value);
      }
    }

    if (name === "area" && value) {
      await fetchGroupByArea(value);
    }

    if (name === "area" && !value) {
      setGroupInfo(null);
      setGroupError(null);
      setFormData((prev) => ({ ...prev, groupId: "" }));
    }

    if (name === "groupId" && value) {
      const selected = cityGroups.find((g) => g._id === value);
      if (selected) {
        setGroupInfo(selected);
        setGroupError(null);
      }
    }

    if (name === "groupId" && !value) {
      if (formData.area) {
        await fetchGroupByArea(formData.area);
      } else {
        setGroupInfo(null);
        setGroupError(null);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.treeName) errors.treeName = "Tree name is required";
    if (!formData.count || formData.count <= 0)
      errors.count = "Valid count is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.area) errors.area = "Area is required";
    if (formData.area && !formData.groupId && !groupInfo)
      errors.groupId =
        "No users found in selected area. Please select a user group from this city.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Determine which group to use: fallback group or auto-assigned group
      const assignedGroupId =
        formData.groupId || selectedGroup || groupInfo?._id;

      if (!assignedGroupId) {
        toastError("No group selected. Please select a group.");
        setLoading(false);
        return;
      }

      const payload = {
        treeName: formData.treeName,
        count: parseInt(formData.count),
        country: formData.country,
        state: formData.state || undefined,
        city: formData.city,
        area: formData.area,
        address: formData.address?.trim() || "",
        group: assignedGroupId,
      };

      console.log("📤 Assignment Payload:", payload);
      console.log("📊 All form data:", formData);
      console.log("👥 Group Info:", groupInfo);

      const res = await axiosInstance.post("/assign", payload);

      if (res.data.Status === 2) {
        // Multiple groups found
        setMultipleGroups(res.data.Groups || []);
        setShowGroupModal(true);
        setLoading(false);
        return;
      }

      if (res.data.Status === 1) {
        toastSuccess(res.data.Message || "Tree assigned successfully");
        navigate("/manage-plantation/assignments");
      } else {
        toastError(res.data.Message || "Failed to assign tree");
      }
    } catch (err) {
      console.error("❌ Assignment Error:", err.response?.data || err.message);
      toastError(err.response?.data?.Message || "Failed to assign tree");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelection = async () => {
    if (!selectedGroup) {
      toastError("Please select a group");
      return;
    }
    const selected = multipleGroups.find((g) => g._id === selectedGroup);
    if (selected) {
      setGroupInfo(selected);
      setFormData((prev) => ({ ...prev, groupId: selectedGroup }));
      setGroupError({
        type: "warning",
        message:
          "Selected area has no active users. Fallback group selected from city.",
      });
    }
    setShowGroupModal(false);
    await handleSubmit({ preventDefault: () => {} });
  };

  const formFields = [
    {
      name: "treeName",
      label: "Tree Name",
      type: "select",
      required: true,
      options: treenames.map((t) => ({ value: t._id, label: t.name })),
    },
    {
      name: "count",
      label: "Tree Count",
      type: "number",
      required: true,
    },
    {
      name: "country",
      label: "Country",
      type: "select",
      required: true,
      options: countries.map((c) => ({ value: c._id, label: c.name })),
    },
    {
      name: "state",
      label: "State",
      type: "select",
      options: states.map((s) => ({ value: s._id, label: s.name })),
      required: true,
      disabled: !formData.country,

    },
    {
      name: "city",
      label: "City",
      type: "select",
      required: true,
      options: cities.map((c) => ({ value: c._id, label: c.name })),
      disabled: !formData.state,
    },
    {
      name: "area",
      label: "Area",
      type: "select",
      required: true,
      options: areas.map((a) => ({ value: a._id, label: a.name })),
      disabled: !formData.city,
    },
    ...(formData.area && (groupError !== null || !!formData.groupId)
      ? [
          {
            name: "groupId",
            label: "Select User Group",
            type: "select",
            required: true,
            options: cityGroups.map((g) => ({
              value: g._id,
              label: `${g.name} (${getGroupMemberCount(g) ?? 0} members)`,
            })),
            disabled: !formData.city,
          },
        ]
      : []),
    {
      name: "address",
      label: "Address",
      type: "textarea",
      required: true,
    },
  ];

  return (
    <div className="container mt-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Assign Trees to Group</h5>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/manage-plantation/assignments")}
          >
            Back to Assignments
          </button>
        </div>

        <div className="card-body">
          {groupInfo && (
            <div className="alert alert-success mb-3">
              <strong>✓ Group Found:</strong> {groupInfo.name} (
              {groupInfo.users?.length || 0} members)
            </div>
          )}

          {groupError && (
            <div
              className={`alert alert-${groupError.type === "warning" ? "warning" : "danger"} mb-3`}
            >
              <strong>
                {groupError.type === "warning" ? "⚠ Warning:" : "✕ Error:"}
              </strong>{" "}
              {groupError.message}
            </div>
          )}

          {!groupInfo && formData.city && cityGroups.length === 0 && (
            <div className="alert alert-warning mb-3">
              <strong>⚠ Note:</strong> No user group with active members found
              in this city.
            </div>
          )}

          <CommonForm
            fields={formFields}
            formData={formData}
            onChange={handleInputChange}
            errors={formErrors}
          />
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/manage-plantation/assignments")}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            title={
              groupError ? "Please select a valid area with group members" : ""
            }
          >
            {loading ? "Assigning..." : "Assign Trees"}
          </button>
        </div>
      </div>

      {/* Multiple Groups Selection Modal */}
      {showGroupModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGroupModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Multiple groups found in this city. Please select one:</p>
                <select
                  className="form-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Select a group</option>
                  {multipleGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGroupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGroupSelection}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAssignment;
