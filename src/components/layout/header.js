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

  const profilePhoto = user?.profilePhoto;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate(userType === "superAdmin" ? "/" : "/user-login");
  };

  // Fetch notifications
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
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleProfile = () => {
    if (user?._id) {
      navigate(`/user-profile/${user._id}`);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="header">
      {/* LOGO */}
      <div className="logo-section">
        <img src={logo} alt="TreeTrace Logo" />
        <span>TreeTrace Monitoring System</span>
      </div>

      <div className="header-actions">
        {/* NOTIFICATION */}
        <div className="notification-wrapper" ref={notificationRef}>
          <FaBell
            size={22}
            style={{ cursor: "pointer" }}
            onClick={() => setShowNotification(!showNotification)}
          />

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}

          {showNotification && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Notifications</span>

                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="notification-empty">No notifications</p>
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

        {/* PROFILE */}
        <div className="profile-wrapper" ref={profileRef}>
          <div
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="profile" className="profile-img" />
            ) : (
              <div className="avatar-circle">
                {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            <span className="profile-name">{user?.firstName}</span>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <button onClick={handleProfile}>View Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
