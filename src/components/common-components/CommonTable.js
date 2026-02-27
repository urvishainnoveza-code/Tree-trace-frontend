/*import React from "react";
import "./common.css";

const CommonTable = ({
  title = "Table",
  subtitle = "",
  columns = [],
  data = [],
  onEdit,
  onDelete,
}) => {
  const hasActions = Boolean(onEdit || onDelete);
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h4 className="card-title">{title}</h4>

        {subtitle && (
          <p className="card-subtitle mb-4 text-muted">{subtitle}</p>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>#</th>

                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}

                {hasActions && (
                  <th style={{ width: "150px" }}>Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 2 : 1)}
                    className="text-center py-4 text-muted"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                safeData.map((row, index) => (
                  <tr key={row._id || index}>
                    <td>{index + 1}</td>

                    {columns.map((col) => (
                      <td key={col.key}>
                        {row[col.key] !== undefined &&
                        row[col.key] !== null
                          ? row[col.key]
                          : "-"}
                      </td>
                    ))}

                    {hasActions && (
                      <td>
                        <div className="d-flex gap-2">
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
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommonTable;*/
/*import React from "react";
import "./common.css";

const CommonTable = ({
  title = "Table",
  subtitle = "",
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onAssign,
}) => {
const hasActions = Boolean(onEdit || onDelete || onAssign);
  const safeData = Array.isArray(data) ? data : [];

  // ✅ Helper: supports nested keys like address.country.countryname
  const getValue = (obj, path) =>
    path.split(".").reduce((o, key) => (o ? o[key] : null), obj);

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h4 className="card-title">{title}</h4>

        {subtitle && (
          <p className="card-subtitle mb-4 text-muted">{subtitle}</p>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>#</th>

                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}

                {hasActions && <th style={{ width: "150px" }}>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 2 : 1)}
                    className="text-center py-4 text-muted"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                safeData.map((row, index) => (
                  <tr key={row._id || index}>
                    <td>{index + 1}</td>

                    {columns.map((col) => (
                      <td key={col.key}>{getValue(row, col.key) ?? "-"}</td>
                    ))}

                    {hasActions && (
                      <td>
                        <div className="d-flex gap-2">
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
                              className="btn btn-success btn-sm"
                              onClick={() => onAssign(row)}
                            >
                              Assign
                            </button>
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
      </div>
    </div>
  );
};

export default CommonTable;*/
import React, { useState, useMemo } from "react";
import "./common.css";

const CommonTable = ({
  title = "Table",
  columns = [],
  data = [],
  onAdd,
  onEdit,
  onDelete,
  onAssign,
  onView,
  addLabel = "+ Add",
}) => {

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(safeData.length / rowsPerPage));

  const paginated = useMemo(() => {
    return safeData.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );
  }, [safeData, page, rowsPerPage]);

  const hasActions = Boolean(onEdit || onDelete);

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
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                {hasActions && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
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
                  <tr key={row._id || i}>
                    <td>{(page - 1) * rowsPerPage + i + 1}</td>

                    {columns.map(col => (
                      <td key={col.key}>{row[col.key] ?? "-"}</td>
                    ))}

                    {hasActions && (
                      <td className="d-flex gap-2">
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
                        {onView && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => onView(row)}
                          >
                            View
                          </button>
                        )}
                        
                        
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

          <select
            className="form-select form-select-sm"
            style={{ width: 80 }}
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>

          <div className="d-flex gap-1">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  page === i + 1 ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
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
