import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";

const Sidebar = () => {
  const userType = localStorage.getItem("userType");

  const navClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>

        {userType === "superAdmin" && (
          <>
            <NavLink to="/master" className={navClass}>
              Master
            </NavLink>

            <NavLink to="/manage-user" className={navClass}>
              Manage User
            </NavLink>

            <NavLink to="/tree-list" className={navClass}>
              Tree List
            </NavLink>
          </>
        )}

        {userType === "user" && (
          <>
            <NavLink to="/view-task" className={navClass}>
              View Task
            </NavLink>

            <NavLink to="/tree-detail" className={navClass}>
              Tree Detail
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;


/*import React from "react";
import { NavLink } from "react-router-dom";
import "./layout.css";

const Sidebar = () => {
  const userType = localStorage.getItem("userType");

  return (
<aside className="sidebar">
      <nav>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
          }
        >
          Dashboard
        </NavLink>

        {userType === "superAdmin" && (
          <>
            <NavLink
              to="/master"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
              }
            >
              Master
            </NavLink>

            <NavLink
              to="/manage-user"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
              }
            >
              Manage User
            </NavLink>

            <NavLink
              to="/tree-list"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
              }
            >
              Tree List
            </NavLink>
          </>
        )}

        {userType === "user" && (
          <>
            <NavLink
              to="/view-task"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
              }
            >
              View Task
            </NavLink>

            <NavLink
              to="/tree-detail"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? "bg-gray-600" : ""}`
              }
            >
              Tree Detail
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;*/
