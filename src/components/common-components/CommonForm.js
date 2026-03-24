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
    <div className="row g-3 common-index-font14">
      {fields.map((field, i) => (
        <div key={i} className={field.colClass || "col-md-6"}>
          <label className="form-label common-index-font14">
            {field.label}
            {field.required && !disabled && (
              <span className="common-required-star common-index-font14">*</span>
            )}
          </label>

          {field.type === "select" ? (
            <select
              name={field.name}
              className="form-select common-index-font14"
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
            <div className="radio-group common-index-font14">
              {field.options?.map((opt) => (
                <label key={opt.value} className="form-check">
                  <input
                    type="radio"
                    name={field.name}
                    className="form-check-input common-index-font14"
                    value={opt.value}
                    checked={formData[field.name] === opt.value}
                    onChange={onChange}
                    disabled={disabled || field.disabled}
                  />
                  <span className="form-check-label common-index-font14">{opt.label}</span>
                </label>
              ))}
            </div>
          ) : field.type === "checkbox" ? (
            <div className="form-check common-index-font14">
              <input
                type="checkbox"
                name={field.name}
                className="form-check-input common-index-font14"
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
          ) : field.type === "file" ? (
            <input
              type="file"
              name={field.name}
              className="form-control common-index-font14"
              accept={field.accept || "image/*"}
              disabled={disabled || field.disabled}
              multiple={field.multiple}
              onChange={onChange}
            />
          ) : field.type === "textarea" ? (
            <textarea
              name={field.name}
              className="form-control common-index-font14"
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
              disabled={disabled || field.disabled}
              placeholder={field.placeholder}
              rows={field.rows || 3}
            />
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              className="form-control common-index-font14"
              value={formData[field.name] || ""}
              onChange={onChange}
              required={field.required}
              disabled={disabled || field.disabled}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
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
