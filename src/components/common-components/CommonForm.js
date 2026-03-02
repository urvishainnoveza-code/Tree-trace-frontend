import React from "react";
import "./common.css";

const CommonForm = ({
  fields,
  formData,
  onChange,
  errors,
  disabled = false,
}) => {
  return (
    <div className="row g-3">
      {fields.map((field, i) => (
        <div key={i} className={field.colClass || "col-md-6"}>
          <label className="form-label">
            {field.label}
            {field.required && !disabled && " *"}
          </label>

          {field.type === "select" ? (
            <select
              name={field.name}
              className="form-select"
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
              disabled={disabled || field.disabled}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "radio" ? (
            <div className="radio-group">
              {field.options?.map((opt) => (
                <label key={opt.value} className="form-check">
                  <input
                    type="radio"
                    name={field.name}
                    className="form-check-input"
                    value={opt.value}
                    checked={formData[field.name] === opt.value}
                    onChange={onChange}
                    disabled={disabled || field.disabled}
                  />
                  <span className="form-check-label">{opt.label}</span>
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" ? (
            <div className="form-check">
              <input
                type="checkbox"
                name={field.name}
                className="form-check-input"
                checked={formData[field.name] || false}
                onChange={(e) =>
                  onChange({
                    target: {
                      name: field.name,
                      value: e.target.checked,
                    },
                  })
                }
                disabled={disabled || field.disabled}
              />
            </div>
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              className="form-control"
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
              disabled={disabled || field.disabled}
            />
          )}

          {errors?.[field.name] && (
            <small className="text-danger">{errors[field.name]}</small>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommonForm;
