import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaBars } from "react-icons/fa";
import "../common-components/common.css";
import axiosInstance from "../../utils/axiosInstance";

const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const Header = ({ onSidebarToggle }) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const user = getStoredUser();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const profilePhoto = user?.profilePhoto;

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target))
        setShowNotification(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleProfile = () => {
    if (user?._id) navigate(`/user-profile/${user._id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(userType === "superAdmin" ? "/" : "/user-login");
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
      {/* ✅ Hamburger — visible on MOBILE only (CSS hides on desktop) */}
      <button className="hamburger-btn" onClick={onSidebarToggle} aria-label="Toggle sidebar">
        <FaBars size={20} />
      </button>

      <div className="header-actions">
        {userType === "user" && (
          <div className="notification-wrapper" ref={notificationRef}>
            <FaBell size={22} style={{ cursor: "pointer" }}
              onClick={() => setShowNotification((prev) => !prev)} />
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
                  <div key={n._id}
                    className={`notification-item ${n.isRead ? "read" : "unread"}`}
                    onClick={() => markAsRead(n._id)}>
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="profile-wrapper" ref={profileRef}>
          <div className="profile-btn" onClick={() => setShowProfileMenu((prev) => !prev)}>
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