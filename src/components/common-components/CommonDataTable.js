import React, { useState, useMemo } from "react";
import CommonTable from "./CommonTable";

const CommonDataTable = ({ data = [], columns = [], onDelete }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🔍 Search logic
  const searchedData = useMemo(() => {
    if (!search) return data;

    return data.filter(row =>
      columns.some(col =>
        String(row[col.key] || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [data, search, columns]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(searchedData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return searchedData.slice(start, start + pageSize);
  }, [searchedData, page, pageSize]);

  return (
    <div>
      {/* Top Controls */}
      <div className="d-flex justify-content-between mb-3 gap-2">
        <input
          className="form-control"
          placeholder="Search..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="form-select"
          style={{ width: "120px" }}
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Table */}
      <CommonTable columns={columns} data={paginatedData} onDelete={onDelete} />

      {/* Pagination */}
      <div className="d-flex justify-content-center gap-2 mt-3">
        <button
          className="btn btn-sm btn-secondary"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Prev
        </button>

        <span>Page {page} / {totalPages || 1}</span>

        <button
          className="btn btn-sm btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CommonDataTable;
