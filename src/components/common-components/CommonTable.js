import React, { useState, useMemo } from "react";
import "./common.css";
import { MdEdit, MdDelete, MdVisibility ,MdCancel} from "react-icons/md";

const CommonTable = ({
  title = "Table",
  columns = [],
  data = [],
  actions,
  onEdit,
  onDelete,
  onAssign,
  onView,
  onCancel,
  rowKey = "_id",
  pagination,
  loading = false,
}) => {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [internalPage, setInternalPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isExternalPagination = Boolean(pagination);
  const currentPage = isExternalPagination
    ? pagination.currentPage
    : internalPage;
  const totalPages = isExternalPagination
    ? pagination.totalPages
    : Math.max(1, Math.ceil(safeData.length / rowsPerPage));
  const handlePageChange = isExternalPagination
    ? pagination.onPageChange
    : setInternalPage;

  const paginated = useMemo(() => {
    if (isExternalPagination) {
      return safeData; // Data already paginated by server
    }
    return safeData.slice(
      (internalPage - 1) * rowsPerPage,
      internalPage * rowsPerPage,
    );
  }, [safeData, internalPage, rowsPerPage, isExternalPagination]);

  const hasActions = Boolean(
    actions || onEdit || onDelete || onAssign || onView,
  );

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  // Simple key/value style: use column.key for data path and column.label for header
  const getCellValue = (row, column) => {
    if (typeof column.render === "function") {
      return column.render(row);
    }

    const keyPath = column.key;
    const value =
      typeof keyPath === "string" ? getNestedValue(row, keyPath) : undefined;

    if (column.valueMap && value !== undefined && value !== null) {
      const mappedValue = column.valueMap[String(value)];
      if (mappedValue !== undefined) return mappedValue;
    }

    if (typeof value === "object" && value !== null) {
      if (typeof value.name === "string") return value.name;
      if (
        typeof value.firstName === "string" &&
        typeof value.lastName === "string"
      ) {
        return `${value.firstName} ${value.lastName}`.trim();
      }
      if (typeof value.firstName === "string") return value.firstName;
      return "-";
    }

    return value ?? "-";
  };

  // Calculate info for pagination bar
  const startIdx =
    paginated.length > 0
      ? (currentPage - 1) *
          (isExternalPagination && pagination.limit
            ? pagination.limit
            : rowsPerPage) +
        1
      : 0;
  const endIdx = paginated.length > 0 ? startIdx + paginated.length - 1 : 0;
  const totalCount =
    isExternalPagination && pagination.total
      ? pagination.total
      : safeData.length;
  const pageSize =
    isExternalPagination && pagination.limit ? pagination.limit : rowsPerPage;
  const pageCount = totalPages;

  return (
    <div className="table-pagination-card">
      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>No</th>
              {columns.map((col, idx) => (
                <th key={col.key || col.label || idx}>
                  {col.label || col.key}
                </th>
              ))}
              {hasActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 2 : 1)}
                  className="text-center py-3"
                >
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 2 : 1)}
                  className="text-center text-muted py-3"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={row[rowKey] || i}>
                  <td>
                    {(currentPage - 1) *
                      (isExternalPagination && pagination.limit
                        ? pagination.limit
                        : rowsPerPage) +
                      i +
                      1}
                  </td>
                  {columns.map((col, idx) => (
                    <td key={col.key || col.label || idx}>
                      {getCellValue(row, col)}
                    </td>
                  ))}
                  {hasActions && (
                    <td>
                      <div className="d-flex gap-2">
                        {/* Support actions array or function */}
                        {actions ? (
                          (() => {
                            const rowActions =
                              typeof actions === "function"
                                ? actions(row)
                                : actions;
                            return rowActions.map((action, idx) => (
                              <button
                                key={idx}
                                className={
                                  action.className ||
                                  `btn btn-sm btn-${action.variant || "primary"}`
                                }
                                onClick={() => action.onClick(row)}
                                disabled={action.disabled}
                              >
                                {action.label}
                              </button>
                            ));
                          })()
                        ) : (
                          <>
                            {onView && (
                              <button
                                className="btn-sm btn-view-custom"
                                onClick={() => onView(row)}
                                title="View"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#e3f2fd",
                                  border: "1px solid #1976d2",
                                  borderRadius: "50%",
                                  width: 27,
                                  height: 27,
                                  justifyContent: "center",
                                
                                  padding: "6px",
                                }}
                              >
                                <MdVisibility
                                  style={{ fontSize: 22, color: "#1976d2" }}
                                />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                className="btn-sm btn-edit-custom"
                                onClick={() => onEdit(row)}
                                title="Edit"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#fffae4",
                                  border: "1px solid #ffb300",
                                  borderRadius: "50%",
                                  width: 27,
                                  height: 27,
                                  justifyContent: "center",
                                
                                  padding: "6px",
                                }}
                              >
                                <MdEdit
                                  style={{ fontSize: 22, color: "#ffb300" }}
                                />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                className="btn-sm btn-delete-custom"
                                onClick={() => onDelete(row)}
                                title="Delete"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#ffebee",
                                  border: "1px solid #d32f2f",
                                  borderRadius: "50%",
                                  width: 27,
                                  height: 27,
                                  justifyContent: "center",
                                 
                                  padding: "6px",
                                }}
                              >
                                <MdDelete
                                  style={{ fontSize: 22, color: "#d32f2f" }}
                                />
                              </button>
                            )}
                            
                            {onAssign && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => onAssign(row)}
                              >
                                Assign
                              </button>
                              )}
                              
                               {onCancel && (
                              <button
                                className="btn-sm btn-cancel-custom"
                                onClick={() => onCancel(row)}
                                title="Cancel"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#ffebee",
                                  border: "1px solid #d32f2f",
                                  borderRadius: "50%",
                                  width: 27,
                                  height: 27,
                                  justifyContent: "center",
                             
                                  padding: "6px",
                                }}
                              >
                                <MdCancel
                                  style={{ fontSize: 22, color: "#d32f2f" }}
                                />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Professional Pagination Bar - inside table card, full width, spaced */}
      <div
        className="pagination-bar single-line-pagination"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
        }}
      >
        <div
          className="pagination-rows"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontSize: "14px", color: "black", fontWeight: 400 }}>
            Page size:
          </span>{" "}
          {!isExternalPagination && (
            <select
              className="form-select"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setInternalPage(1);
              }}
              style={{
                width: 60,
                height: 32,
                fontSize: 14,
                fontWeight: 400,
                textAlign: "center",
                borderRadius: 8,
                color: "black",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          )}
          {isExternalPagination && (
            <span style={{ fontWeight: 600 }}>{pageSize}</span>
          )}
        </div>
        <span
          style={{ marginLeft: 150, fontSize: 14, color: "black", gap: 8 }}
        >{`${startIdx} to ${endIdx} of ${totalCount}`}</span>
        <button
          style={{ color: "black" }}
          className="btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &lt;
        </button>
        <span
          style={{ fontWeight: 400, fontSize: 14 }}
        >{`Page ${currentPage} of ${pageCount}`}</span>
        <button
          style={{ color: "black", marginRight: 10 }}
          className="btn"
          disabled={currentPage === pageCount}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CommonTable;
