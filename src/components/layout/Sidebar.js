import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import "../common-components/common.css";
import {
  MdDashboard,
  MdPeople,
  MdAssignment,
  MdSettings,
} from "react-icons/md";
import { FaTree } from "react-icons/fa";

const Sidebar = ({ open, onToggle }) => {
  const userType = localStorage.getItem("userType");

  const navClass = ({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`;

  let navItems = [];
  if (userType === "superAdmin") {
    navItems = [
      {
        to: "/admin-dashboard",
        icon: <MdDashboard size={20} />,
        label: "Dashboard",
      },
      {
        to: "/donor-index",
        icon: <FaTree size={18} />,
        label: "Donations",
      },
      {
        to: "/manage-user",
        icon: <MdPeople size={20} />,
        label: "Manage User",
      },
      {
        to: "/manage-plantation/assignments",
        icon: <MdAssignment size={20} />,
        label: "Tree Assignments",
      },
      {
        to: "/tree-detail",
        icon: <FaTree size={18} />,
        label: "Tree Detail",
      },
      { to: "/master", icon: <MdSettings size={20} />, label: "Master" },
    ];
  } else if (userType === "donor") {
    navItems = [
      {
        to: "/donor-dashboard",
        icon: <MdDashboard size={20} />,
        label: "Dashboard",
      },
      {
        to: "/donor-index",
        icon: <FaTree size={18} />,
        label: "My Donations",
      },
    ];
  } else {
    navItems = [
      {
        to: "/admin-dashboard",
        icon: <MdDashboard size={20} />,
        label: "Dashboard",
      },
      {
        to: "/view-task",
        icon: <MdAssignment size={20} />,
        label: "My Tasks",
      },
      {
        to: "/tree-detail",
        icon: <FaTree size={18} />,
        label: "Tree Detail",
      },
      {
        to: "/groupMember",
        icon: <MdPeople size={20} />,
        label: "Group Members",
      },
    ];
  }

  return (
    <aside
      className={`sidebar-fixed ${open ? "sidebar-full" : "sidebar-icon-only"}`}
    >
      {/* LOGO AREA — click to toggle */}
      <div
        className="sidebar-logo-area"
        onClick={onToggle}
        title="Toggle sidebar"
      >
        <img src={logo} alt="Logo" className="sidebar-logo-full" />
        {/* Icon-only mode shows a small version */}
        <span className="sidebar-logo-icon">
          <FaTree size={22} color="#fff" />
        </span>
      </div>

      {/* NAV LINKS */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navClass}
            title={!open ? item.label : ""} // tooltip when collapsed
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
