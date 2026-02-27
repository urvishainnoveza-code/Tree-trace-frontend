import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth, setAuth } from "../../utils/auth";
import "../../App.css";

const UserLogin = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  
useEffect(() => {
    const { token, userType } = getAuth();

    if (token && userType === "user") {
      navigate("/user-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!formData.email) return alert("Enter email");

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/user/send-otp",
        { email: formData.email }
      );

      alert("OTP sent successfully");
      setStep(2);
    } catch {
      alert("User not found");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!formData.otp) return alert("Enter OTP");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/user/verify-otp",
        {
          email: formData.email,
          otp: formData.otp,
        }
      );

      setAuth(res.data.token, "user");
      navigate("/user-dashboard");
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h2 className="login-title">
          {step === 1 ? "User Login" : "Enter OTP"}
        </h2>

        {/* STEP 1 - EMAIL */}
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p className="text-center mt-3">
              New user?{" "}
              <span
                className="register-link"
                onClick={() => navigate("/register")}
              >
                Register here
              </span>
            </p>
          </form>
        )}

        {/* STEP 2 - OTP */}
        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div className="mb-2 text-center text-muted small">
              {formData.email}
            </div>

            <div className="mb-3">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className="form-control"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setStep(1)}
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserLogin;


/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommonModel from "../../components/common-components/CommonModel";
import CommonForm from "../../components/common-components/CommonForm";
import { getAuth, setAuth } from "../../utils/auth";

const UserLogin = () => {
  const navigate = useNavigate();

  const [showModel, setShowModel] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const { token, userType } = getAuth();

    if (token && userType === "user") {
      navigate("/user-dashboard");
    }
  }, [navigate]);

  const fields =
    step === 1
      ? [{ label: "Email", name: "email", type: "email", required: true }]
      : [{ label: "OTP", name: "otp", type: "text", required: true }];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = async () => {
    if (!formData.email) return alert("Enter email");

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/user/send-otp",
        { email: formData.email }
      );

      alert("OTP sent successfully");
      setStep(2);
    } catch {
      alert("User not found");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) return alert("Enter OTP");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/user/verify-otp",
        {
          email: formData.email,
          otp: formData.otp,
        }
      );

      // ✅ Save auth using helper
      setAuth(res.data.token, "user");

      navigate("/user-dashboard");
    } catch {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    step === 1 ? sendOtp() : verifyOtp();
  };

  const handleClose = () => {
    setShowModel(false);
    navigate("/");
  };

  return (
    <CommonModel
      show={showModel}
      title={step === 1 ? "User Login" : "Enter OTP"}
      onSave={handleSubmit}
      onClose={handleClose}
      saveText={
        loading
          ? "Please wait..."
          : step === 1
          ? "Send OTP"
          : "Verify OTP"
      }
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
      />

      {step === 1 && (
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          New user?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      )}
    </CommonModel>
  );
};

export default UserLogin;*/