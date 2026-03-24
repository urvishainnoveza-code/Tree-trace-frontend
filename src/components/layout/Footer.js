import React from "react";
import "../common-components/common.css";

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} TreeTrace Monitoring System. All rights
      reserved.
    </footer>
  );
};

export default Footer;
