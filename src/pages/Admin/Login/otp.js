import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth } from "../../../utils/auth";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";
import "../../../components/common-components/common.css";

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

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const otpChars = Array.from({ length: 6 }, (_, i) => otp[i] || "");
    otpChars[index] = value;
    const nextOtp = otpChars.join("").slice(0, 6);
    setOtp(nextOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) {
      return;
    }
    setOtp(pasted);

    const focusIndex = Math.min(pasted.length, 6) - 1;
    const targetInput = document.getElementById(`otp-digit-${focusIndex}`);
    if (targetInput) {
      targetInput.focus();
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
      <div className="auth-left">
        <div className="illustration-overlay">
          <div className="illustration-title">TreeTrack</div>
          <div className="illustration-sub">
            Verify your login securely with the one-time passcode.
          </div>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Verify OTP</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleVerify}>
            <div className="auth-form-group">
              <label className="auth-label">6-Digit OTP</label>
              <div className="auth-otp-group" onPaste={handleOtpPaste}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    id={`otp-digit-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={otp[index] || ""}
                    onChange={(e) =>
                      handleOtpDigitChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="auth-otp-digit"
                    disabled={isSubmitting}
                    autoFocus={index === 0}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
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
