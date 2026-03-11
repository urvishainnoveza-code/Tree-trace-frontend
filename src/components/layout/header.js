import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import "./layout.css";
import { FaBell } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const user = getStoredUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("checkRole");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilepic");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleId");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLng");

    navigate(userType === "superAdmin" ? "/" : "/user-login");
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000); // auto refresh

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/manage-user/edit/${user._id}`);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications([]);
      setUnreadCount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error("Read all error:", error);
    }
  };

  return (
    <header className="header">
      <div className="logo-section">
        <img src={logo} alt="TreeTrace Logo" />
        <span>TreeTrace Monitoring System</span>
      </div>

      <div className="header-actions">
        <div className="notification-wrapper" ref={dropdownRef}>
          <FaBell
            size={22}
            style={{ cursor: "pointer", marginRight: "20px" }}
            onClick={() => setShowDropdown((prev) => !prev)}
          />

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="notification-empty">No new notifications</p>
              )}

              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="notification-item"
                  onClick={() => markAsRead(n._id)}
                >
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

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
