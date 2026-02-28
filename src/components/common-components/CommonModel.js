import React from "react";
import "./common.css";

const CommonModel = ({
  show,
  title,
  children,
  onClose,
  buttons = [], // Array of button objects: [{label, onClick, variant, disabled}]
  onSave,
  saveText = "Save",
}) => {
  if (!show) return null;

  // If buttons array provided, use it; otherwise fall back to onSave/onClose pattern
  const renderButtons = () => {
    if (buttons.length > 0) {
      return buttons.map((btn, index) => (
        <button
          key={index}
          className={`btn btn-${btn.variant || "secondary"}`}
          onClick={btn.onClick}
          disabled={btn.disabled || false}
        >
          {btn.label}
        </button>
      ));
    }

    // Fallback to old pattern
    return (
      <>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        {onSave && (
          <button className="btn btn-primary" onClick={onSave}>
            {saveText}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body scrollable">{children}</div>

        <div className="modal-footer">{renderButtons()}</div>
      </div>
    </div>
  );
};

export default CommonModel;
