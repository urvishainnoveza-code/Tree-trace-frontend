import React from "react";
import "./common.css";

const CommonForm = ({ fields, formData, onChange, errors }) => {
  return (
    <div className="common-form">
      {fields.map((field, i) => (
        <div key={i} className="form-group">
          <label>{field.label}</label>

          {field.type === "select" ? (
            <select
              name={field.name}
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
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
                <label key={opt.value}>
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={formData[field.name] === opt.value}
                    onChange={onChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) =>
                onChange({
                  target: {
                    name: field.name,
                    value: e.target.checked,
                  },
                })
              }
            />
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
            />
          )}

          {errors?.[field.name] && (
            <span className="error-text">
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommonForm;
