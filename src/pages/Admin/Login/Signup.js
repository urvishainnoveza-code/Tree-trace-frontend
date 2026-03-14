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
      <div className="auth-left">
        <div className="illustration-overlay">
          <div className="left-inner-card">
            <div className="left-inner-illustration" />
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="pill-toggle">
            <button onClick={() => navigate('/')} >Sign In</button>
            <button className="active">Sign Up</button>
          </div>

          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="auth-grid-2">
              <div className="auth-form-group">
                <label className="auth-label">First Name <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required className="auth-input" disabled={isSubmitting} autoFocus />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Last Name <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required className="auth-input" disabled={isSubmitting} />
                </div>
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Email Address <span className="auth-required">*</span></label>
              <div className="input-with-icon">
                <span className="icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5L12 13L21 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="auth-input" disabled={isSubmitting} />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Phone Number <span className="auth-required">*</span></label>
              <div className="input-with-icon">
                <span className="icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 013 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.12 1.05.38 2.08.78 3.03a2 2 0 01-.45 2.11L9.91 10.09a14.66 14.66 0 006 6l1.2-1.2a2 2 0 012.11-.45c.95.4 1.98.66 3.03.78A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <input type="tel" name="phoneNo" placeholder="Phone number" value={formData.phoneNo} onChange={handlePhoneChange} required className="auth-input" disabled={isSubmitting} minLength="10" maxLength="15" />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phoneNo}>{isSubmitting ? "Creating Account..." : "Sign Up"}</button>

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
