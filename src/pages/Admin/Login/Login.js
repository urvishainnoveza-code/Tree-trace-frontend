import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { setAuth, getAuth } from "../../../utils/auth";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../../utils/alertHelper";

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
      const res = await axiosInstance.post("/users/login", { email });
      const { Status, Message } = res.data;

      if (Status === 2) {
        toastInfo(Message || "Password required for SuperAdmin");
        setShowPassword(true);
      } else if (Status === 3) {
        toastInfo(Message || "OTP sent to your email");
        localStorage.setItem("email", email);
        navigate("/otp");
      } else if (Status === 1) {
        // Already logged in with token
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
        toastError(Message || "Invalid user");
      }
    } catch (err) {
      const responseData = err.response?.data;
      const { Status, Message } = responseData || {};

      // Handle Status 2 and 3 in error responses (backend returns 400 with Status codes)
      if (Status === 2) {
        toastInfo(Message || "Password required for SuperAdmin");
        setShowPassword(true);
      } else if (Status === 3) {
        toastInfo(Message || "OTP sent to your email");
        localStorage.setItem("email", email);
        navigate("/otp");
      } else {
        toastError(Message || "Email not found");
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
      const res = await axiosInstance.post("/users/login", {
        email,
        password,
      });

      const { Status, UserToken, user, Message } = res.data;

      if (Status === 1 && UserToken && user) {
        setAuth(UserToken, user);
        toastSuccess("SuperAdmin Login Successful!");
        setTimeout(() => navigate("/admin-dashboard"), 500);
      } else {
        toastError(Message || "Invalid password");
      }
    } catch (err) {
      const responseData = err.response?.data;
      const { Status, UserToken, user, Message } = responseData || {};

      // Handle successful login in error response
      if (Status === 1 && UserToken && user) {
        setAuth(UserToken, user);
        toastSuccess("SuperAdmin Login Successful!");
        setTimeout(() => navigate("/admin-dashboard"), 500);
      } else {
        toastError(Message || "Login failed");
      }
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
              <h2 className="text-center mb-2 fw-bold text-success">
                Tree Trace
              </h2>
            

              {!showPassword ? (
                // EMAIL FORM
                <form onSubmit={handleEmailSubmit}>
                 
                  <div className="form-group mb-4">
                    <label className="form-label fw-600">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control form-control-user"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isSubmitting || !email}
                  >
                    {isSubmitting ? "Checking..." : "Continue"}
                  </button>
                </form>
              ) : (
                // PASSWORD FORM (SuperAdmin)
                <form onSubmit={handlePasswordSubmit}>
                  

                  <div className="form-group mb-4">
                    <label className="form-label fw-600">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter SuperAdmin Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-control form-control-user"
                      disabled={isSubmitting}
                      autoFocus
                      minLength="6"
                    />
                 
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isSubmitting || !password}
                  >
                    {isSubmitting ? "Logging In..." : "Login as SuperAdmin"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link w-100 mt-2 text-muted"
                    onClick={() => {
                      setShowPassword(false);
                      setPassword("");
                      setEmail("");
                    }}
                    disabled={isSubmitting}
                  >
                    ← Back to Email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
