import React, { useState, useMemo } from "react";
import "./common.css";

const CommonTable = ({
  title = "Table",
  columns = [],
  data = [],
  actions, // Can be array or function
  onAdd,
  onEdit,
  onDelete,
  onAssign,
  onView,
  addLabel = "+ Add",
  rowKey = "_id",
  pagination, // External pagination: { currentPage, totalPages, onPageChange }
  loading = false,
}) => {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Internal pagination state (used when pagination prop is not provided)
  const [internalPage, setInternalPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use external pagination if provided, otherwise internal
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

  // Only paginate locally if using internal pagination
  const paginated = useMemo(() => {
    if (isExternalPagination) {
      return safeData; // Data already paginated by server
    }
    return safeData.slice(
      (internalPage - 1) * rowsPerPage,
      internalPage * rowsPerPage,
    );
  }, [safeData, internalPage, rowsPerPage, isExternalPagination]);

  // Support both actions array and individual callbacks
  const hasActions = Boolean(
    actions || onEdit || onDelete || onAssign || onView,
  );

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  // Simple key/value style: use column.key for data path and column.label for header
  const getCellValue = (row, column) => {
    const keyPath = column.key;
    const value =
      typeof keyPath === "string" ? getNestedValue(row, keyPath) : undefined;

    if (column.valueMap && value !== undefined && value !== null) {
      const mappedValue = column.valueMap[String(value)];
      if (mappedValue !== undefined) return mappedValue;
    }

    return value ?? "-";
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{title}</h4>

          {onAdd && (
            <button className="btn btn-sm btn-primary" onClick={onAdd}>
              {addLabel}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
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
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => onView(row)}
                                >
                                  View
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => onEdit(row)}
                                >
                                  Edit
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => onDelete(row)}
                                >
                                  Delete
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

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          {!isExternalPagination && (
            <select
              className="form-select form-select-sm"
              style={{ width: 80 }}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setInternalPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          )}
          {isExternalPagination && <div />}

          <div className="d-flex gap-1">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              «
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  currentPage === i + 1
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonTable;
