/*import React from "react";
import "./common.css";

const CommonModel = ({
  show,
  title,
  children,
  onClose,
  onSave,
  saveText = "Save",
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body scrollable ">{children}</div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onSave && (
            <button className="btn btn-primary" onClick={onSave}>
              {saveText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonModel;*/
import React from "react";
import "./common.css";

const CommonModel = ({
  show,
  title,
  children,
  onClose,
  onSave,
  saveText = "Save",
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body scrollable">
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {onSave && (
            <button className="btn btn-primary" onClick={onSave}>
              {saveText}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CommonModel;
