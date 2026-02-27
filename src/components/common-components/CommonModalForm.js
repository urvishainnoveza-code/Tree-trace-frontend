import React from "react";
import "./common.css";

const CommonModalForm = ({
  visible,
  title,
  sections = [],
  values,
  onChange,
  onCancel,
  onSubmit,
  submitLabel = "Save",
}) => {
  if (!visible) return null;

  const handleChange = (name, value) => {
    onChange({
      
      ...values,
      [name]: value,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onCancel}>X</button>
        </div>

        <div className="modal-body">
          {sections.map((section, i) => (
            <div key={i} className="form-section">
              <h4 className="section-title">{section.title}</h4>

              <div className="form-grid">
                {section.fields.map((field, index) => (
                  <div className="form-group" key={index}>
                    <label>{field.label}</label>

                    {field.type === "select" && (
                      <select
                        value={values[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {field.options?.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "radio" && (
                      <div className="radio-group">
                        {field.options.map((opt, idx) => (
                          <label key={idx} className="radio-label">
                            <input
                              type="radio"
                              name={field.name}
                              value={opt.value}
                              checked={values[field.name] === opt.value}
                              onChange={(e) =>
                                handleChange(field.name, e.target.value)
                              }
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    )}

                    {(!field.type ||
                      (field.type !== "select" &&
                        field.type !== "radio")) && (
                      <input
                        type={field.type || "text"}
                        value={values[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn submit" onClick={onSubmit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonModalForm;
