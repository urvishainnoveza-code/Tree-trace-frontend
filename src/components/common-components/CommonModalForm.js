import React from "react";
import "./common.css";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import "../common-components/common.css";

const CommonModalForm = ({
  visible,
  title,
  sections = [],
  fields = [],
  values,
  onChange,
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  errors = {},
  requiredFields = [],
  imagePreview = null,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (!visible) return null;

  const handleChange = (name, value) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  const handleFieldChange = (name, value) => {
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
          {/* Handle sections format */}
          {sections && sections.length > 0 && (
            <>
              {sections.map((section, i) => (
                <div key={i} className="form-section">
                  <h4 className="section-title">{section.title}</h4>

                  <div className="form-grid">
                    {section.fields.map((field, index) => {
                      const isRequired = requiredFields.includes(field.name);
                      const fieldError = errors[field.name];

                      return (
                        <div className="form-group" key={index}>
                          {field.label && (
                            <label>
                              {field.label}{" "}
                              {isRequired && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                          )}

                          {field.type === "select" && (
                            <select
                              className={`form-select common-index-font14 ${fieldError ? "is-invalid" : ""}`}
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
                                <label
                                  key={idx}
                                  className="radio-label common-index-font14 "
                                >
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

                          {field.type === "textarea" && (
                            <textarea
                              className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                              placeholder={field.placeholder || ""}
                              value={values[field.name] || ""}
                              onChange={(e) =>
                                handleChange(field.name, e.target.value)
                              }
                              rows={field.rows || 3}
                            />
                          )}

                          {field.type === "date" && (
                            <input
                              type="date"
                              className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                              value={values[field.name] || ""}
                              onChange={(e) =>
                                handleChange(field.name, e.target.value)
                              }
                            />
                          )}

                          {field.type === "checkbox" && (
                            <div className="form-check mt-2">
                              <input
                                type="checkbox"
                                className={fieldError ? "is-invalid" : ""}
                                id={field.name}
                                checked={values[field.name] || false}
                                onChange={(e) =>
                                  handleChange(field.name, e.target.checked)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={field.name}
                              >
                                {field.placeholder || field.label}
                              </label>
                            </div>
                          )}

                          {field.type === "file" && (
                            <>
                              {imagePreview || values[field.name] ? (
                                <div className="mb-2">
                                  <img
                                    src={
                                      imagePreview ||
                                      (typeof values[field.name] === "string"
                                        ? values[field.name]
                                        : "")
                                    }
                                    alt="Preview"
                                    style={{
                                      maxWidth: "200px",
                                      height: "auto",
                                      maxHeight: "150px",
                                    }}
                                  />
                                  <div className="mt-1">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger me-2"
                                      onClick={() =>
                                        handleChange(field.name, null)
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  className={fieldError ? "is-invalid" : ""}
                                  accept={field.accept || "image/*"}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    handleChange(field.name, file);
                                  }}
                                />
                              )}
                            </>
                          )}

                          {(!field.type ||
                            (field.type !== "select" &&
                              field.type !== "radio" &&
                              field.type !== "textarea" &&
                              field.type !== "date" &&
                              field.type !== "checkbox" &&
                              field.type !== "file")) && (
                            <input
                              type={field.type || "text"}
                              className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                              placeholder={field.placeholder || ""}
                              value={values[field.name] || ""}
                              onChange={(e) =>
                                handleChange(field.name, e.target.value)
                              }
                            />
                          )}

                          {fieldError && (
                            <div className="invalid-feedback d-block">
                              {fieldError}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Handle fields array format */}
          {fields && fields.length > 0 && (
            <>
              {fields.map((field) => {
                const isRequired = requiredFields.includes(field.name);
                const fieldError = errors[field.name];

                return (
                  <div className="form-group" key={field.name}>
                    {field.label && (
                      <label>
                        {field.label}{" "}
                        {isRequired && <span className="text-danger">*</span>}
                      </label>
                    )}

                    {field.type === "textarea" ? (
                      <textarea
                        className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                        placeholder={field.placeholder || ""}
                        value={values[field.name] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        rows={field.rows || 3}
                      />
                    ) : field.type === "date" ? (
                      <input
                        type="date"
                        className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                        value={values[field.name] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.name, e.target.value)
                        }
                      />
                    ) : field.type === "select" ? (
                      <Select
                        classNamePrefix="common-index-font14"
                        className="common-index-font14"
                        options={field.options || []}
                        isMulti={field.isMulti}
                        placeholder={
                          field.placeholder ||
                          `Select ${field.label || field.name}`
                        }
                        value={
                          field.isMulti
                            ? (values[field.name] || []).map((val) =>
                                field.options.find((opt) => opt.value === val),
                              )
                            : field.options.find(
                                (opt) => opt.value === values[field.name],
                              ) || null
                        }
                        onChange={(selected) =>
                          handleFieldChange(
                            field.name,
                            field.isMulti
                              ? (selected || []).map((s) => s.value)
                              : selected?.value || "",
                          )
                        }
                      />
                    ) : field.type === "file" ? (
                      <>
                        {(imagePreview && field.name === "images") ||
                        values[field.name] ? (
                          <div className="mb-2">
                            <img
                              src={
                                imagePreview ||
                                (typeof values[field.name] === "string"
                                  ? values[field.name]
                                  : values[field.name]
                                    ? URL.createObjectURL(values[field.name])
                                    : "")
                              }
                              alt="Preview"
                              style={{
                                maxWidth: "200px",
                                height: "auto",
                                maxHeight: "150px",
                              }}
                            />
                            <div className="mt-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger me-2"
                                onClick={() =>
                                  handleFieldChange(field.name, null)
                                }
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                            accept={field.accept || "image/*"}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              handleFieldChange(field.name, file);
                            }}
                          />
                        )}
                      </>
                    ) : field.type === "checkbox" ? (
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className={`form-check-input common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                          id={field.name}
                          checked={values[field.name] || false}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={field.name}
                        >
                          {field.placeholder || field.label}
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.type || "text"}
                        className={`form-control common-index-font14 ${fieldError ? "is-invalid" : ""}`}
                        placeholder={field.placeholder || ""}
                        value={values[field.name] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.name, e.target.value)
                        }
                      />
                    )}

                    {fieldError && (
                      <div className="invalid-feedback d-block">
                        {fieldError}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="pagination-nav" aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => onPageChange && onPageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ),
              )}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}

        <div className="modal-footer">
          <button className="btn cancel" onClick={onCancel}>
            {cancelLabel}
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
