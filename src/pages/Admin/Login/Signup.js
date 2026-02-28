import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth, getAuth } from "../../../utils/auth";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const auth = getAuth();
    if (auth?.token && auth?.user) {
      const role = auth.user.role?.name;
      navigate(role === "superAdmin" ? "/admin-dashboard" : "/user-dashboard");
    }
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle phone number input (only numbers)
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        phoneNo: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toastError("Invalid email format");
      return;
    }

    // Validate phone number (minimum 10 digits)
    if (formData.phoneNo.length < 10) {
      toastError("Phone number must be at least 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      toastInfo("Creating your account...");

      const normalizedData = {
        ...formData,
        email: formData.email.toLowerCase().trim(),
      };

      const response = await axiosInstance.post(
        "/users/signup",
        normalizedData,
      );

      const { Status, Message, Data } = response.data;

      if (Status === 1 && Data?.UserToken && Data?.user) {
        setAuth(Data.UserToken, Data.user);
        toastSuccess(Message || "Account created successfully!");
        setTimeout(() => {
          navigate(
            Data.user.role?.name === "superAdmin"
              ? "/admin-dashboard"
              : "/user-dashboard",
          );
        }, 500);
      } else {
        toastError(Message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage =
        error.response?.data?.Message ||
        "Signup failed. Please try again later.";
      toastError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Tree Trace</h2>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="auth-grid-2">
              <div className="auth-form-group">
                <label className="auth-label">
                  First Name <span className="auth-required">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  Last Name <span className="auth-required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Email Address <span className="auth-required">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Phone Number <span className="auth-required">*</span>
              </label>
              <input
                type="tel"
                name="phoneNo"
                placeholder="Enter phone number"
                value={formData.phoneNo}
                onChange={handlePhoneChange}
                required
                className="auth-input"
                disabled={isSubmitting}
                minLength="10"
                maxLength="15"
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={
                isSubmitting ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.phoneNo
              }
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="auth-divider-top auth-text-center">
              <p className="auth-muted">
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-btn-link"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
