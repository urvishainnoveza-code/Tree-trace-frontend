import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}`);

        if (res.data.Status === 1) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("User fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning text-center mt-5">User not found</div>
    );
  }

  return (
    <div className="profile-page container mt-4">
      <div className="card profile-card">
        <div className="card-header">
          <h4 className="card-title">User Profile</h4>
        </div>
        <div className="card-body">
          {user ? (
            <div>
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Personal Information</h5>
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phoneNo || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {user.gender || "N/A"}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {user.birthDate
                      ? new Date(user.birthDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="col-md-6">
                  <h5>Address Information</h5>
                  <p>
                    <strong>Country:</strong> {user.country?.name || "N/A"}
                  </p>
                  <p>
                    <strong>State:</strong> {user.state?.name || "N/A"}
                  </p>
                  <p>
                    <strong>City:</strong> {user.city?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Area:</strong> {user.area?.name || "N/A"}
                  </p>
                  <p>
                    <strong>House No:</strong> {user.houseNo || "N/A"}
                  </p>
                  <p>
                    <strong>Society:</strong> {user.societyName || "N/A"}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {user.landmark || "N/A"}
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Account Status</h5>
                  <p>
                    <strong>Role:</strong> {user.role?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        user.isActive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p>
                    <strong>Email Verified:</strong>{" "}
                    <span
                      className={`badge ${
                        user.emailVerified ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {user.emailVerified ? "Yes" : "No"}
                    </span>
                  </p>
                </div>

                <div className="col-md-6">
                  <h5>Administrative Info</h5>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                  {user.addedBy && (
                    <p>
                      <strong>Added By:</strong> {user.addedBy.firstName}{" "}
                      {user.addedBy.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center">No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
