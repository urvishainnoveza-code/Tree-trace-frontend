import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth } from "../../../utils/auth";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";

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
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-2 fw-bold">Tree Trace</h2>

              <form onSubmit={handleVerify}>
                <div className="form-group mb-4">
                  <label className="form-label fw-600">6-Digit OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    className="form-control form-control-user text-center"
                    style={{ fontSize: "24px", letterSpacing: "8px" }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-block w-100"
                  disabled={isSubmitting || otp.length !== 6}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-muted"
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
      </div>
    </div>
  );
}

export default Otp;
