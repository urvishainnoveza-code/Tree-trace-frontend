import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { showAlert } from "../../utils/alertHelper";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");

      setNotifications(res.data?.notifications || []);
      setUnread(res.data?.unreadCount || 0);
    } catch (error) {
      console.log("Notification error:", error);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      const res = await axiosInstance.put("/notifications/read-all");

      if (res.data.Status === 1) {
        showAlert(res.data.Message, "success");

        setUnread(0); // reset unread count
        await fetchNotifications(); // refresh notification list
      } else {
        showAlert(res.data.Message, "error");
      }
    } catch (error) {
      showAlert(
        error.message || "Failed to mark notifications as read",
        "error",
      );
      console.log("Mark all read error:", error);
    }
  };

  // Run when component loads
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Notification Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Unread: {unread}</span>

        {unread > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="notification-box">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n._id} className="notification-item">
              <p>{n.message}</p>
            </div>
          ))
        ) : (
          <p
            style={{
              padding: "10px",
              textAlign: "center",
              color: "#999",
            }}
          >
            No notifications
          </p>
        )}
      </div>
    </div>
  );
}

export default NotificationBell;
