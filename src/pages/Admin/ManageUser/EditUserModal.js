import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    birthDate: "",
    gender: "",
    houseNo: "",
    societyName: "",
    landmark: "",
    area: "",
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNo: user.phoneNo || "",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        gender: user.gender || "",
        houseNo: user.houseNo || "",
        societyName: user.societyName || "",
        landmark: user.landmark || "",
        area: user.area?._id || "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await axiosInstance.get("/areas");
      if (res.data.Status === 1) {
        setAreas(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch areas error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!formData.firstName.trim()) {
      toastError("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      toastError("Last name is required");
      return;
    }
    if (formData.phoneNo && !/^\d+$/.test(formData.phoneNo)) {
      toastError("Phone number must contain only digits");
      return;
    }
    if (formData.phoneNo && formData.phoneNo.length < 10) {
      toastError("Phone number must be at least 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(`/users/${user._id}`, formData);
      if (res.data.Status === 1) {
        toastSuccess(res.data.Message || "User updated successfully");
        onSuccess(res.data.user || res.data.data);
        onClose();
      } else {
        toastError(res.data.Message || "Failed to update user");
      }
    } catch (err) {
      console.error("Update user error:", err);
      toastError(err.response?.data?.Message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div
            className="modal-header"
            style={{ backgroundColor: "#1b5e20", color: "white" }}
          >
            <h5 className="modal-title">Edit User</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email (Read-only)</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    maxLength="15"
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
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
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
                    value={formData.houseNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Society Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="societyName"
                    value={formData.societyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Landmark</label>
                  <input
                    type="text"
                    className="form-control"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Area</label>
                  <select
                    className="form-control"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
