import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../common-components/common.css";

const MainLayout = ({ children }) => {
  // true = full sidebar, false = icon-only collapsed
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="layout-wrapper">
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Overlay for closing sidebar on outside click */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 998,
            background: "rgba(0,0,0,0.15)",
          }}
        />
      )}

      {/* Main content shifts based on sidebar width */}
      <div
        className={`layout-main ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}
      >
        <Header onSidebarToggle={handleSidebarToggle} />
        <div className="main-content-area">
          <div className="content-wrapper">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
