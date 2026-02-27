import React from "react";
import Header from "./header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./layout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      {/* Fixed Header */}
      <Header />

      <div className="layout-body">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Scrollable Content Area */}
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>

          {/* Footer INSIDE scroll */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;



/*import React from "react";
import Header from "./header";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;*/
