import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonForm from "../../../components/common-components/CommonForm";
import { getUser, getUserType } from "../../../utils/auth";
import {
  confirmDelete,
  toastError,
  toastSuccess,
} from "../../../utils/alertHelper";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNo: "",
  birthDate: "",
  gender: "",
  houseNo: "",
  societyName: "",
  landmark: "",
  country: "",
  state: "",
  city: "",
  area: "",
};

const UserIndex = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const loggedInUser = getUser();
  const userType = getUserType();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [mode, setMode] = useState("add");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formFields, setFormFields] = useState([]);

  const isSuperAdmin = userType === "superAdmin";

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

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = { page, limit, search };

      if (userType) {
        params.userType = userType;
      }

      if (userType === "superAdmin") {
        params.excludeRole = "superAdmin"; // Tell backend to exclude superAdmin records
      }

      if (userType !== "superAdmin" && loggedInUser?._id) {
        params.userId = loggedInUser._id;
      }

      const res = await axiosInstance.get("/users", { params });

      const payload = res.data || {};
      const status = payload.Status ?? payload.status;
      const usersPayload = payload.data || {};

      if (status === 1) {
        const filteredUsers = (usersPayload.users || []).filter(
          (user) => user.role?.name !== "superAdmin",
        );
        setUsers(filteredUsers);
        setTotalPages(usersPayload.totalPages || 1);
        setTotalUsers(usersPayload.totalUsers || 0);
      } else {
        toastError(
          payload.Message || payload.message || "Failed to fetch users",
        );
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      toastError(err.response?.data?.Message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      const payload = res.data || {};
      setCountries(payload.data || payload.countries || []);
    } catch (err) {
      console.error("Country fetch error:", err);
      toastError("Failed to fetch countries");
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const params = countryId ? { country: countryId } : {};
      const res = await axiosInstance.get("/states", { params });
      const payload = res.data || {};
      setStates(payload.data || payload.states || []);
    } catch (err) {
      console.error("State fetch error:", err);
      setStates([]);
    }
  };

  const fetchCities = async (countryId, stateId) => {
    try {
      const params = {
        ...(countryId ? { country: countryId } : {}),
        ...(stateId ? { state: stateId } : {}),
      };
      const res = await axiosInstance.get("/cities", { params });
      const payload = res.data || {};
      setCities(payload.data || payload.cities || []);
    } catch (err) {
      console.error("City fetch error:", err);
      setCities([]);
    }
  };

  const fetchAreas = async (countryId, stateId, cityId) => {
    try {
      const params = {
        ...(countryId ? { country: countryId } : {}),
        ...(stateId ? { state: stateId } : {}),
        ...(cityId ? { city: cityId } : {}),
      };
      const res = await axiosInstance.get("/areas", { params });
      const payload = res.data || {};
      setAreas(payload.data || payload.areas || []);
    } catch (err) {
      console.error("Area fetch error:", err);
      setAreas([]);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setStates([]);
    setCities([]);
    setAreas([]);
    setSelectedUser(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setMode("add");
    resetForm();
    if (location.pathname !== "/manage-user") {
      if (isSuperAdmin) {
        navigate("/manage-user");
      } else {
        navigate("/user-dashboard");
      }
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !isSuperAdmin &&
      location.pathname === "/manage-user" &&
      loggedInUser?._id
    ) {
      navigate(`/manage-user/edit/${loggedInUser._id}`, { replace: true });
    }
  }, [isSuperAdmin, location.pathname, loggedInUser, navigate]);

  const loadUserById = async (userId, targetMode = "edit") => {
    try {
      if (!isSuperAdmin && loggedInUser?._id?.toString() !== userId) {
        toastError("You can only edit your own profile");
        closeModal();
        navigate("/manage-user");
        return;
      }

      setShowModal(true);
      setMode(targetMode);

      const res = await axiosInstance.get(`/users/${userId}`);
      const payload = res.data || {};
      if ((payload.Status ?? payload.status) !== 1 || !payload.user) {
        toastError(payload.Message || "Failed to fetch user details");
        closeModal();
        return;
      }

      const fetchedUser = payload.user;
      const countryId = fetchedUser.country?._id || "";
      const stateId = fetchedUser.state?._id || "";
      const cityId = fetchedUser.city?._id || "";

      setSelectedUser(fetchedUser);
      setFormData({
        firstName: fetchedUser.firstName || "",
        lastName: fetchedUser.lastName || "",
        email: fetchedUser.email || "",
        phoneNo: fetchedUser.phoneNo || "",
        birthDate: fetchedUser.birthDate
          ? String(fetchedUser.birthDate).split("T")[0]
          : "",
        gender: fetchedUser.gender || "",
        houseNo: fetchedUser.houseNo || "",
        societyName: fetchedUser.societyName || "",
        landmark: fetchedUser.landmark || "",
        country: countryId,
        state: stateId,
        city: cityId,
        area: fetchedUser.area?._id || "",
      });

      if (countryId) await fetchStates(countryId);
      if (stateId) await fetchCities(countryId, stateId);
      if (cityId) await fetchAreas(countryId, stateId, cityId);
    } catch (err) {
      toastError(err.response?.data?.Message || "Failed to fetch user details");
      closeModal();
    }
  };

  useEffect(() => {
    const isAddRoute = location.pathname === "/manage-user/add";
    const isEditRoute = location.pathname.startsWith("/manage-user/edit/");

    if (isAddRoute) {
      setMode("add");
      resetForm();
      setShowModal(true);
      return;
    }

    if (isEditRoute && id) {
      loadUserById(id, "edit");
      return;
    }

    setShowModal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.pathname]);

  const openAddModal = () => {
    if (location.pathname !== "/manage-user/add") {
      navigate("/manage-user/add");
    }
  };

  const openEditModal = async (user) => {
    const isSelfEdit = loggedInUser?._id === user._id;
    if (!isSuperAdmin && !isSelfEdit) {
      toastError("You can only edit your own profile");
      return;
    }
    if (location.pathname !== `/manage-user/edit/${user._id}`) {
      navigate(`/manage-user/edit/${user._id}`);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName?.trim())
      nextErrors.firstName = "First name is required";
    if (!formData.lastName?.trim())
      nextErrors.lastName = "Last name is required";
    if (!formData.email?.trim()) nextErrors.email = "Email is required";
    if (!formData.area) nextErrors.area = "Area is required";

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleDelete = async (user) => {
    const result = await confirmDelete(
      `Are you sure you want to delete "${user.firstName} ${user.lastName}"?`,
    );

    if (!result.isConfirmed) return;

    try {
      const res = await axiosInstance.delete(`/users/${user._id}`);
      const payload = res.data || {};
      if ((payload.Status ?? payload.status) === 1) {
        toastSuccess(payload.Message || "User deleted successfully");
        fetchUsers(1, debouncedSearchQuery);
      } else {
        toastError(payload.Message || "Failed to delete user");
      }
    } catch (err) {
      toastError(err.response?.data?.Message || "Failed to delete user");
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "country") {
      setFormData((prev) => ({ ...prev, state: "", city: "", area: "" }));
      setStates([]);
      setCities([]);
      setAreas([]);
      if (value) await fetchStates(value);
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, city: "", area: "" }));
      setCities([]);
      setAreas([]);
      if (value) await fetchCities(formData.country, value);
    }

    if (name === "city") {
      setFormData((prev) => ({ ...prev, area: "" }));
      setAreas([]);
      if (value) await fetchAreas(formData.country, formData.state, value);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNo: formData.phoneNo,
        birthDate: formData.birthDate,
        gender: formData.gender,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        area: formData.area,
        houseNo: formData.houseNo,
        societyName: formData.societyName,
        landmark: formData.landmark,
      };

      if (mode === "add") {
        payload.userType = "user";
        const res = await axiosInstance.post("/users", payload);
        const responsePayload = res.data || {};
        if ((responsePayload.Status ?? responsePayload.status) === 1) {
          toastSuccess(responsePayload.Message || "User created successfully");
          closeModal();
          fetchUsers(1, debouncedSearchQuery);
        } else {
          toastError(responsePayload.Message || "Failed to create user");
        }
      }

      if (mode === "edit" && selectedUser?._id) {
        const res = await axiosInstance.put(
          `/users/${selectedUser._id}`,
          payload,
        );
        const responsePayload = res.data || {};
        if ((responsePayload.Status ?? responsePayload.status) === 1) {
          toastSuccess(responsePayload.Message || "User updated successfully");
          closeModal();
          fetchUsers(1, debouncedSearchQuery);
        } else {
          toastError(responsePayload.Message || "Failed to update user");
        }
      }
    } catch (err) {
      toastError(err.response?.data?.Message || "Failed to submit user");
    } finally {
      setSubmitting(false);
    }
  };

  // Update form fields when dependencies change
  useEffect(() => {
    setFormFields([
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        disabled: mode === "edit",
      },
      {
        name: "phoneNo",
        label: "Phone",
        type: "text",
      },
      {
        name: "birthDate",
        label: "Birth Date",
        type: "date",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      {
        name: "country",
        label: "Country",
        type: "select",
        options: countries.map((c) => ({ value: c._id, label: c.name })),
      },
      {
        name: "state",
        label: "State",
        type: "select",
        options: states.map((s) => ({ value: s._id, label: s.name })),
        disabled: !formData.country,
      },
      {
        name: "city",
        label: "City",
        type: "select",
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
      {
        name: "houseNo",
        label: "House No",
        type: "text",
      },
      {
        name: "societyName",
        label: "Society Name",
        type: "text",
      },
      {
        name: "landmark",
        label: "Landmark",
        type: "text",
      },
    ]);
  }, [
    countries,
    states,
    cities,
    areas,
    formData.country,
    formData.state,
    formData.city,
    mode,
  ]);

  const handleEditUser = (user) => {
    openEditModal(user);
  };

  const handleDeleteUser = (user) => {
    // Only superAdmin can delete
    if (!isSuperAdmin) {
      toastError("Only superAdmin can delete users");
      return;
    }
    handleDelete(user);
  };

  const isListPage = location.pathname === "/manage-user";
  const isFormPage =
    location.pathname === "/manage-user/add" ||
    location.pathname.startsWith("/manage-user/edit/");

  return (
    <div className="container mt-4">
      {isListPage && isSuperAdmin && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Manage Users</h3>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={openAddModal}>
                Add New User
              </button>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {isSuperAdmin && (
                <div className="mb-2 text-muted">Total Users: {totalUsers}</div>
              )}
              <CommonTable
                columns={[
                  { label: "Name", key: "firstName" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phoneNo" },
                  { label: "Country", key: "country.name" },
                  { label: "State", key: "state.name" },
                  { label: "City", key: "city.name" },
                  { label: "Area", key: "area.name" },

                  {
                    label: "Status",
                    key: "isActive",
                    valueMap: { true: "Active", false: "Inactive" },
                  },
                ]}
                data={users}
                onEdit={(user) => {
                  const isSelfEdit = loggedInUser?._id === user._id;
                  if (!isSuperAdmin && !isSelfEdit) {
                    toastError("You can only edit your own profile");
                    return;
                  }
                  handleEditUser(user);
                }}
                onDelete={handleDeleteUser}
                rowKey="_id"
              />

              {totalPages > 1 && (
                <nav className="mt-3" aria-label="User pagination">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </>
      )}

      {isFormPage && showModal && (
        <div className="card border-0 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {mode === "add" && "Add User"}
              {mode === "edit" &&
                (loggedInUser?._id?.toString() === selectedUser?._id?.toString()
                  ? "Edit My Profile"
                  : "Edit User")}
            </h5>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={closeModal}
              >
                Back to Users
              </button>
            </div>
          </div>

          <div className="card-body">
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
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                  ? "Create User"
                  : loggedInUser?._id?.toString() ===
                      selectedUser?._id?.toString()
                    ? "Update My Profile"
                    : "Update User"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIndex;
