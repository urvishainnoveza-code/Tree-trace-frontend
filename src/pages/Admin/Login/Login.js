import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth, getAuth } from "../../../utils/auth";
import { v4 as uuidv4 } from "uuid";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";
import "./Auth.css";
function Login() {
  const navigate = useNavigate();
  const [locationAllowed, setLocationAllowed] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location permission check on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      toastError("Geolocation is not supported in this browser.");
      setLocationAllowed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // Do NOT store location in localStorage. Only use live GPS for login validation.
      },
      (error) => {
        toastError("Please allow location access to continue.");
        setLocationAllowed(false);
      },
    );
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "android";
    if (/iPad|iPhone|iPod/.test(ua)) return "ios";
    return "desktop";
  };

  const getDeviceToken = () => {
    return uuidv4();
  };

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

    if (!locationAllowed || !coords.latitude || !coords.longitude) {
      toastError(
        "Location not available. Please allow location access and refresh the page. If you still see this, check your browser settings or contact support.",
      );
      console.log("Login attempt without location:", coords);
      return;
    }

    const deviceId = getDeviceId();
    const devicetype = getDeviceType();
    const devicetoken = getDeviceToken();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim();
      const res = await axiosInstance.post("/users/login", {
        email: normalizedEmail,
        latitude: coords.latitude,
        longitude: coords.longitude,
        deviceId,
        devicetype,
        devicetoken,
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
        // Do NOT store location for later use. Only use live GPS for login validation.
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

  // Add a manual location refresh button for professional user experience
  /*
  const handleLocationRefresh = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          localStorage.setItem("userLat", position.coords.latitude);
          localStorage.setItem("userLng", position.coords.longitude);
          toastSuccess("Location refreshed!");
        },
        (error) => {
          toastError("Failed to refresh location. Please allow access.");
        },
      );
    } else {
      toastError("Geolocation is not supported in this browser.");
    }
  };
  */

  // Show location prompt or error before login UI
  if (locationAllowed === null) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="w-50 d-block bg-white shadow-lg rounded my-5">
          <div className="p-5 text-center">
            <h1 className="h5 mb-3">Welcome Back!</h1>
            <div className="mb-4">
              Requesting location access. Please allow to continue…
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (locationAllowed === false) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="w-50 d-block bg-white shadow-lg rounded my-5">
          <div className="p-5 text-center">
            <h1 className="h5 mb-3">Welcome Back!</h1>
            <div className="text-danger mb-4">
              Location access required to continue.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ...existing code for login UI...
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="illustration-overlay">
          <div className="illustration-title">TreeTrack</div>
          <div className="illustration-sub">
            Track, monitor & manage your trees efficiently.
          </div>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="pill-toggle">
            <button className="active">Sign In</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">
            {!showPassword
              ? "Welcome back! Please login to continue"
              : "Enter your password"}
          </p>
        </div>
        <div className="auth-body">
          {!showPassword ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  Email Address <span className="auth-required">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="icon" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 6.5L12 13L21 6.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Checking..." : "Continue"}
              </button>
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
            <form onSubmit={handlePasswordSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  Password <span className="auth-required">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="icon" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M7 11V8a5 5 0 0110 0v3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                    disabled={isSubmitting}
                    autoFocus
                    minLength="6"
                  />
                </div>
                <div className="forgot-row">
                  <button
                    type="button"
                    className="auth-btn-link"
                    onClick={() => {
                      /* implement forgot */
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting || !password}
              >
                {isSubmitting ? "Logging In..." : "Sign In"}
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
