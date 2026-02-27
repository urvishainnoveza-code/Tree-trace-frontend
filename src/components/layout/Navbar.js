import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const userType = localStorage.getItem("userType"); // ✅ read role

  return (
    <nav className="navbar shadow-sm">
      {/* Shared menu */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Dashboard
      </NavLink>

      {userType === "superAdmin" && (
        <>
          <NavLink
            to="/master"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Master
          </NavLink>

          <NavLink
            to="/manage-user"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            ManageUser
          </NavLink>

          

          <NavLink
            to="/tree-list"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Tree list
          </NavLink>
         

        </>
      )}
      {userType === "user" && (
        <>
          
          <NavLink
            to="/view-task"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            ViewTask
          </NavLink>
          
          <NavLink
            to="/tree-detail"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Tree detail
          </NavLink>
          

        </>
      )}
    </nav>
  );
};

export default Navbar;
