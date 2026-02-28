import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/users/${id}`);

      if (res.data.Status === 1) {
        setUser(res.data.user);
        setEditData(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
    fetchCountries();
  }, [fetchUser]);

  const fetchCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      setCountries(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    }
  };

  const fetchStates = async (countryId) => {
    if (!countryId) return;
    try {
      const res = await axiosInstance.get(`/states/country/${countryId}`);
      setStates(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch states", err);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) return;
    try {
      const res = await axiosInstance.get(`/cities/state/${stateId}`);
      setCities(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!cityId) return;
    try {
      const res = await axiosInstance.get(`/areas/city/${cityId}`);
      setAreas(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch areas", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "country" && value !== editData.country?._id) {
      fetchStates(value);
      setEditData((prev) => ({ ...prev, state: "", city: "", area: "" }));
    }
    if (name === "state" && value !== editData.state?._id) {
      fetchCities(value);
      setEditData((prev) => ({ ...prev, city: "", area: "" }));
    }
    if (name === "city" && value !== editData.city?._id) {
      fetchAreas(value);
      setEditData((prev) => ({ ...prev, area: "" }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNo: editData.phoneNo,
        birthDate: editData.birthDate,
        gender: editData.gender,
        houseNo: editData.houseNo,
        societyName: editData.societyName,
        landmark: editData.landmark,
        area: editData.area?._id || editData.area,
      };

      const res = await axiosInstance.put(`/users/${id}`, payload);

      if (res.data.Status === 1) {
        alert("User updated successfully");
        setUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.Message || "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/manage-users")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">User not found</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/manage-users")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/admin/manage-users")}
      >
        ← Back to Users
      </button>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>User Profile</h4>
          <button
            className={`btn ${isEditing ? "btn-secondary" : "btn-warning"}`}
            onClick={() => {
              if (isEditing) {
                setEditData(user);
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="card-body">
          {isEditing ? (
            // Edit Form
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={editData.firstName || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={editData.lastName || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    disabled
                    value={editData.email || ""}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phoneNo"
                    value={editData.phoneNo || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    name="birthDate"
                    value={
                      editData.birthDate ? editData.birthDate.split("T")[0] : ""
                    }
                    onChange={handleEditChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    name="gender"
                    value={editData.gender || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">House No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="houseNo"
                    value={editData.houseNo || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Society Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="societyName"
                    value={editData.societyName || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  className="form-control"
                  name="landmark"
                  value={editData.landmark || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Country</label>
                  <select
                    className="form-control"
                    name="country"
                    value={editData.country?._id || ""}
                    onChange={handleEditChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">State</label>
                  <select
                    className="form-control"
                    name="state"
                    value={editData.state?._id || ""}
                    onChange={handleEditChange}
                    disabled={!editData.country}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <select
                    className="form-control"
                    name="city"
                    value={editData.city?._id || ""}
                    onChange={handleEditChange}
                    disabled={!editData.state}
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Area</label>
                  <select
                    className="form-control"
                    name="area"
                    value={editData.area?._id || ""}
                    onChange={handleEditChange}
                    disabled={!editData.city}
                  >
                    <option value="">Select Area</option>
                    {areas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="btn btn-success" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">First Name</h6>
                  <p>{user.firstName}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Last Name</h6>
                  <p>{user.lastName}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Email</h6>
                  <p>{user.email}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Phone No</h6>
                  <p>{user.phoneNo || "N/A"}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Date of Birth</h6>
                  <p>
                    {user.birthDate
                      ? new Date(user.birthDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Gender</h6>
                  <p>{user.gender || "N/A"}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Role</h6>
                  <p>{user.role?.name || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Status</h6>
                  <p>
                    <span
                      className={`badge ${user.isActive ? "bg-success" : "bg-danger"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>

              <hr />

              <h5 className="mb-3">Address Details</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Country</h6>
                  <p>{user.country?.name || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">State</h6>
                  <p>{user.state?.name || "N/A"}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">City</h6>
                  <p>{user.city?.name || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Area</h6>
                  <p>{user.area?.name || "N/A"}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <h6 className="text-muted">House No</h6>
                  <p>{user.houseNo || "N/A"}</p>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Society Name</h6>
                  <p>{user.societyName || "N/A"}</p>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Landmark</h6>
                  <p>{user.landmark || "N/A"}</p>
                </div>
              </div>

              <hr />

              <div className="row text-muted">
                <div className="col-md-6">
                  <small>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="col-md-6">
                  <small>
                    Last Updated:{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;

/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddUser from "./AddUser";

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });

  // -----------------------------
  // Fetch Users
  // -----------------------------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users");
      const data = res.data || [];

      const mappedData = data.map((u) => ({
        ...u,
        area: u.address?.area?.areaname || "",
        city: u.address?.city?.cityname || "",
        state: u.address?.state?.statename || "",
        country: u.address?.country?.countryname || "",
        countryId: u.address?.country?._id || "",
        stateId: u.address?.state?._id || "",
        cityId: u.address?.city?._id || "",
        areaId: u.address?.area?._id || "",
      }));

      setUsers(mappedData);
      setFilteredUsers(mappedData);

      // Create unique dropdown lists
      setDropdowns({
        countryId: [
          ...new Map(
            mappedData.map((u) => [
              u.countryId,
              { _id: u.countryId, name: u.country },
            ])
          ).values(),
        ],
        stateId: [
          ...new Map(
            mappedData.map((u) => [
              u.stateId,
              { _id: u.stateId, name: u.state },
            ])
          ).values(),
        ],
        cityId: [
          ...new Map(
            mappedData.map((u) => [
              u.cityId,
              { _id: u.cityId, name: u.city },
            ])
          ).values(),
        ],
        areaId: [
          ...new Map(
            mappedData.map((u) => [
              u.areaId,
              { _id: u.areaId, name: u.area },
            ])
          ).values(),
        ],
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -----------------------------
  // Apply Filter
  // -----------------------------
  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = users;

    if (selectedFilters.countryId)
      filtered = filtered.filter(
        (u) => u.countryId === selectedFilters.countryId
      );

    if (selectedFilters.stateId)
      filtered = filtered.filter(
        (u) => u.stateId === selectedFilters.stateId
      );

    if (selectedFilters.cityId)
      filtered = filtered.filter(
        (u) => u.cityId === selectedFilters.cityId
      );

    if (selectedFilters.areaId)
      filtered = filtered.filter(
        (u) => u.areaId === selectedFilters.areaId
      );

    setFilteredUsers(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      countryId: "",
      stateId: "",
      cityId: "",
      areaId: "",
    });
    setFilteredUsers(users);
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.firstName}?`)) return;

    await axios.delete(
      `http://localhost:5000/api/auth/users/${row._id}`
    );

    const updated = users.filter((u) => u._id !== row._id);
    setUsers(updated);
    setFilteredUsers(updated);
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Area", key: "area" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>User List</h2>

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
          filtersToShow={[
            "countryId",
            "stateId",
            "cityId",
            "areaId",
          ]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="User List"
          addLabel="+ Add User"
          columns={columns}
          data={filteredUsers}
          onAdd={() => setShowAddUser(true)}
          onDelete={handleDelete}
        />
      )}

      <AddUser
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSaved={fetchUsers}
      />
    </div>
  );
};

export default ViewUser;*/

/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddUser from "./AddUser";
import CommonFilter from "../../../components/common-components/CommonFilter";

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });


  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users");

      const data = res.data || [];
      const mappedData = data.map((u) => ({
        
          ...u,
          area: u.address?.area?.areaname || "",
          city: u.address?.city?.cityname || "",
          state: u.address?.state?.statename || "",
          country: u.address?.country?.countryname || "",
          countryId: u.address?.country?._id || "",
          stateId: u.address?.state?._id || "",
          cityId: u.address?.city?._id || "",
          areaId: u.address?.area?._id || "",

        
      }));
      setUsers(mappedData);
      setFilteredUsers(mappedData);

      setDropdowns({
        countryId: [...new Map(mappedData.map(u => [u.countryId, { _id: u.countryId, countryName: u.country }])).values()],
        stateId: [...new Map(mappedData.map(u => [u.stateId, { _id: u.stateId, stateName: u.state }])).values()],
        cityId: [...new Map(mappedData.map(u => [u.cityId, { _id: u.cityId, cityName: u.city }])).values()],
        areaId: [...new Map(mappedData.map(u => [u.areaId, { _id: u.areaId, areaName: u.area }])).values()],
      });



      //setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = users;

    // Apply filters step by step
    if (newFilters.countryId) filtered = filtered.filter(u => u.countryId === newFilters.countryId);
    if (newFilters.stateId) filtered = filtered.filter(u => u.stateId === newFilters.stateId);
    if (newFilters.cityId) filtered = filtered.filter(u => u.cityId === newFilters.cityId);
    if (newFilters.areaId) filtered = filtered.filter(u => u.areaId === newFilters.areaId);

    setFilteredUsers(filtered);
  };

  const handleClearFilters = () => {
    setFilters({ countryId: "", stateId: "", cityId: "", areaId: "" });
    setFilteredUsers(users);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.firstName}?`)) return;

    await axios.delete(`http://localhost:5000/api/auth/users/${row._id}`);
    setUsers((prev) => prev.filter((u) => u._id !== row._id));
  };



  const columns = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Area", key: "area" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>User List</h2>

        <button
          className="btn btn-outline-primary"

          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      
      </div>

      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["countryId", "stateId", "cityId", "areaId"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}


      {loading ? (
        <p>Loading...</p>
      ) : (
          <CommonTable
            title="User List"
            addLabel="Add User"
          columns={columns}
            data={filteredUsers}
            onAdd={() => setShowAddUser(true)}
          onDelete={handleDelete}
        />
      )}

      <AddUser
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSaved={() => fetchUsers()}
      />
    </div>
  );
};

export default ViewUser;*/
