import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../../utils/auth";
import "../../../App.css";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Optional: call API to verify email
      // await axios.post("/api/auth/check-email", { email: formData.email });

      setStep(2);
    } catch (err) {
      setError("Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = res.data;

      setAuth(token, user.userType);

      if (user.userType === "superAdmin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h1 className="login-title">Welcome Back!</h1>

        {error && (
          <div className="alert alert-danger text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-next w-100"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Next"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-2 text-center text-muted small">
              {formData.email}
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            
            {/*   <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setStep(1)}
              >
                Change Email
              </button>
            </div>*/}
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;



/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommonModel from "../../../components/common-components/CommonModel";
import CommonForm from "../../../components/common-components/CommonForm";
import { getAuth, setAuth } from "../../../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    const { token, userType } = getAuth();

    if (!token) return;

    if (userType === "superAdmin") navigate("/admin-dashboard");
    else navigate("/user-dashboard");
  }, [navigate]);

  const fields = [
    { label: "Email", name: "email", required: true },
    { label: "Password", name: "password", type: "password", required: true },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = res.data;

      // ✅ Save auth using helper
      setAuth(token, user.userType);
      // ✅ Redirect by role
      if (user.userType === "superAdmin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }

    } catch (err) {
      alert("Invalid email or password");
      console.error(err);
    }
  };

  return (
    <CommonModel
      show={showModal}
      title="Login"
      onSave={handleSubmit}
      onClose={handleClose}
      saveText="Login"
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
      />
    </CommonModel>
  );
};

export default Login;*/


/*import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommonModel from "../../../components/common-components/CommonModel";
import CommonForm from "../../../components/common-components/CommonForm";
import "../../../components/common-components/common.css";

const Login = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const fields = [
    { label: "Email", name: "email", required: true },
    { label: "Password", name: "password", type: "password", required: true },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", user.userType);

      handleClose();

      if (user.userType === "superAdmin") navigate("/admin-dashboard");
      else navigate("/user-dashboard");

    } catch (err) {
      alert("Invalid login");
    }
  };

  return (
    <CommonModel
      show={showModal}
      title="Login"
      onSave={handleSubmit}
      onClose={handleClose}
      saveText="Login"
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
      />

      
    </CommonModel>
  );
};

export default Login;*/


/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";
import "../../../components/common-components/common.css";

const Login = (show,onClose) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const fields = [
    { label: "Email", name: "email", required: true },
    { label: "Password", name: "password", type: "password", required: true },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", user.userType);

      if (user.userType === "superAdmin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">
          <center>Login</center>
        </h2>
        <CommonModel
          show={show}
          title="Login"
          onClose={onClose}
          onSave={handleSubmit}
          saveText="Login"

>
        

        <CommonForm
          fields={fields}
          formData={formData}
          onChange={handleChange}
         // onSubmit={handleSubmit}
          />
          </CommonModel>
      </div>
    </div>
  );
};

export default Login;*/
