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

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //login check
  useEffect(() => {
    const auth = getAuth();
    if (auth?.token && auth?.user) {
      const role = auth.user.role?.name;
      navigate(role === "superAdmin" ? "/admin-dashboard" : "/user-dashboard");
    }
  }, [navigate]);

  //check email & password
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim();
      const res = await axiosInstance.post("/users/login", {
        email: normalizedEmail,
      });

      console.log("Login Response:", res.data);
      const { Status, Message } = res.data;

      if (Status === 2) {
        toastInfo(Message || "Password required for SuperAdmin");
        setShowPassword(true);
      } else if (Status === 3) {
        console.log("OTP flow triggered, navigating to /otp");
        toastInfo(Message || "OTP sent to your email");
        localStorage.setItem("email", normalizedEmail);
        navigate("/otp");
      } else if (Status === 1) {
        const { UserToken, user } = res.data;
        setAuth(UserToken, user);
        toastSuccess("Login successful!");
        setTimeout(
          () =>
            navigate(
              user.role?.name === "superAdmin"
                ? "/admin-dashboard"
                : "/user-dashboard",
            ),
          500,
        );
      } else {
        toastError(Message || "Invalid response from server");
      }
    } catch (err) {
      console.log("Login Error:", err.response);
      const responseData = err.response?.data;
      const { Status, Message } = responseData || {};

      if (Status === 2) {
        toastInfo(Message || "Password required for SuperAdmin");
        setShowPassword(true);
      } else if (Status === 3) {
        const normalizedEmail = email.trim();
        console.log("OTP flow triggered in catch, navigating to /otp");
        toastInfo(Message || "OTP sent to your email");
        localStorage.setItem("email", normalizedEmail);
        navigate("/otp");
      } else {
        toastError(Message || "User not found");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: SuperAdmin Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim();
      const res = await axiosInstance.post("/users/login", {
        email: normalizedEmail,
        password,
      });

      const { Status, UserToken, user, Message } = res.data;

      if (Status === 1 && UserToken && user) {
        setAuth(UserToken, user);
        toastSuccess(Message || "SuperAdmin Login Successful!");
        setTimeout(() => navigate("/admin-dashboard"), 500);
      } else {
        toastError(Message || "Invalid password");
      }
    } catch (err) {
      const responseData = err.response?.data;
      const { Message } = responseData || {};
      toastError(Message || "Login failed. Please check your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Tree Trace</h2>
          <p className="auth-subtitle">
            {!showPassword
              ? "Welcome back! Please login to continue"
              : "Enter your password"}
          </p>
        </div>

        <div className="auth-body">
          {!showPassword ? (
            // EMAIL FORM
            <form onSubmit={handleEmailSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  Email Address <span className="auth-required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Checking..." : "Continue"}
              </button>

              {/* Sign Up Link */}
              <div className="auth-divider-top auth-text-center">
                <p className="auth-muted">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="auth-btn-link"
                    onClick={() => navigate("/signup")}
                    disabled={isSubmitting}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            // PASSWORD FORM (SuperAdmin)
            <form onSubmit={handlePasswordSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  Password <span className="auth-required">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter SuperAdmin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  disabled={isSubmitting}
                  autoFocus
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting || !password}
              >
                {isSubmitting ? "Logging In..." : "Login as SuperAdmin"}
              </button>

              <button
                type="button"
                className="auth-btn-link auth-btn-back"
                onClick={() => {
                  setShowPassword(false);
                  setPassword("");
                  setEmail("");
                }}
                disabled={isSubmitting}
              >
                ← Back to Email
              </button>

              {/* Sign Up Link */}
              <div className="auth-divider-top auth-text-center">
                <p className="auth-muted">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="auth-btn-link"
                    onClick={() => navigate("/signup")}
                    disabled={isSubmitting}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
