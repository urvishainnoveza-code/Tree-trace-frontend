import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth } from "../../../utils/auth";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";
import "./Auth.css";

function Otp() {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      toastError("No email found. Please login again.");
      navigate("/");
    }
  }, [email, navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value === "" || (value.match(/^\d+$/) && value.length <= 6)) {
      setOtp(value);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toastError("OTP must be 6 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      toastInfo("Verifying OTP...");

      const response = await axiosInstance.post("/users/verifyOtp", {
        email,
        otp,
      });

      const { Status, UserToken, user, Message } = response.data;

      if (Status === 1 && UserToken && user) {
        setAuth(UserToken, user);
        toastSuccess("Login successful!");
        setTimeout(() => navigate("/user-dashboard"), 500);
      } else {
        toastError(Message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMessage =
        error.response?.data?.Message ||
        "OTP verification failed. Please try again.";
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
          <p className="auth-subtitle">Enter OTP to continue</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleVerify}>
            <div className="auth-form-group">
              <label className="auth-label">6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                className="auth-input auth-otp"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="auth-divider-top auth-text-center">
              <button
                type="button"
                className="auth-btn-link"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Otp;
