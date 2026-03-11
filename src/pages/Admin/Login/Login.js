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
  {
    /*const handleLocationRefresh = () => {
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
  };*/
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Tree Trace</h2>
          <h1 className="h5 mb-3 text-center">Welcome Back!</h1>
        </div>

        {locationAllowed === null ? (
          <div className="auth-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="auth-subtitle">Requesting location access...</p>
            <p className="text-muted small">
              Please allow location access to continue
            </p>
          </div>
        ) : locationAllowed === false ? (
          <div className="auth-body text-center py-5">
            <p className="auth-subtitle text-danger">
              Location access required to continue
            </p>
            <p className="text-muted small">
              Please enable location access in your browser settings
            </p>
          </div>
        ) : (
          <>
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
                    disabled={
                      isSubmitting ||
                      !email ||
                      !coords.latitude ||
                      !coords.longitude ||
                      locationAllowed !== true
                    }
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

                  {/* Refresh Location button can be removed or kept for fallback, but is no longer required */}
                  {/* <button
                    type="button"
                    className="auth-btn-secondary"
                    onClick={handleLocationRefresh}
                    disabled={isSubmitting}
                  >
                    Refresh Location
                  </button> */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
