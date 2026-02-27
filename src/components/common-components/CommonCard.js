// CommonCard.js
import React from "react";
import "./common.css";

const CommonCard = ({ title, icon, onClick }) => {
  return (
    <div className="common-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div className="card-title">{title}</div>
    </div>
  );
};

export default CommonCard;
