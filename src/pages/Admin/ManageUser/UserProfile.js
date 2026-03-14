import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import "./profile.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}`);

        if (res?.data?.Status === 1) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/manage-user/edit/${user._id}`);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h5>Loading user profile...</h5>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <h5>User not found</h5>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-placeholder">
              {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div className="profile-info">
            <div className="profile-name-row">
              <h3 className="profile-name">
                {user?.firstName} {user?.lastName}
              </h3>

              <span
                className={`badge ${
                  user?.isActive ? "bg-success" : "bg-danger"
                }`}
              >
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="profile-phone">
              <span className="phone-icon">📞</span>
              <span>{user?.phoneNo || "N/A"}</span>
            </div>
          </div>

          <button className="btn btn-sm btn-info" onClick={handleEditProfile}>
            Edit
          </button>
        </div>

        {/* Personal + Address */}
        <div className="profile-sections">
          <div className="profile-box">
            <h5>Personal Information</h5>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Gender:</strong> {user?.gender || "N/A"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {user?.birthDate
                ? new Date(user.birthDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div className="profile-box">
            <h5>Address Information</h5>
            <p>
              <strong>Country:</strong> {user?.country?.name || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {user?.state?.name || "N/A"}
            </p>
            <p>
              <strong>City:</strong> {user?.city?.name || "N/A"}
            </p>
            <p>
              <strong>Area:</strong> {user?.area?.name || "N/A"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {[user?.houseNo, user?.societyName, user?.landmark]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </p>
          </div>
        </div>

        {/* Administrative Info */}
        <div className="profile-admin">
          <h5>Administrative Info</h5>

          <div className="admin-row">
            <div>
              <strong>Created:</strong>{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </div>

            <div>
              <strong>Last Updated:</strong>{" "}
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString()
                : "N/A"}
            </div>

            <div>
              <strong>Added By:</strong>{" "}
              {user?.addedBy
                ? `${user.addedBy.firstName} ${user.addedBy.lastName}`
                : "System"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
