import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import "./layout.css";

const Header = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");

    navigate(userType === "superAdmin" ? "/" : "/user-login");
  };

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/manage-user/edit/${user._id}`);
    }
  };
  
  return (
    <header className="header">
      <div className="logo-section">
        <img src={logo} alt="TreeTrace Logo" />
        <span>TreeTrace Monitoring System</span>
      </div>

      <div className="header-actions">
        {userType === "user" && (
          <button
            onClick={handleEditProfile}
            className="edit-profile-btn"
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

/*import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const userType = localStorage.getItem("userType");

    localStorage.removeItem("token");
    localStorage.removeItem("userType");

    if (userType === "superAdmin") {
      navigate("/");
    } else {
      navigate("/user-login"); 
    }
  };

  return (
    <header className="header bg-primary text-white p-3 flex justify-between items-center flex-wrap">
      <div className="logo font-bold text-xl flex items-center gap-2">
        <img src={logo} alt="TreeTrace Logo" className="h-10 w-auto" />
        TreeTrace
      </div>

      <div className="user-profile flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="btn-logout bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;*/
