import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTreename from "./AddTreename";
import EditTreename from "./EditTreename";

const ViewTreename = () => {
  const [treename, setTreename] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTreename, setSelectedTreename] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;


  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);


  const fetchTreename = async (page = 1, search = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/treename?page=${page}&limit=${limit}&search=${search}`
      );

      setTreename(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching treename:", err);
      setTreename([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreename(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handleEdit = (row) => {
    setSelectedTreename(row);
    setShowEdit(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.treename}"?`)) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/treename/${row._id}`
      );
      fetchTreename(currentPage, debouncedSearch);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAddSaved = () => {
    setShowAdd(false);
    fetchTreename(currentPage, debouncedSearch);
  };

  const handleEditSaved = () => {
    setShowEdit(false);
    setSelectedTreename(null);
    fetchTreename(currentPage, debouncedSearch);
  };

  const columns = [{ label: "Tree Name", key: "treename" }];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2 className="fw-bold">Tree List</h2>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search tree name (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <CommonTable
        title="Tree List"
        addLabel="+ Add Tree"
        columns={columns}
        data={treename}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddTreename
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
      />

      {selectedTreename && (
        <EditTreename
          show={showEdit}
          treename={selectedTreename}
          onClose={() => setShowEdit(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
};

export default ViewTreename;



/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTreename from "./AddTreename";
import EditTreename from "./EditTreename";

const ViewTreename = () => {
  const [treename, setTreename] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTreename, setSelectedTreename] = useState(null);

  const fetchTreename = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/treename");
      setTreename(res.data.data || []);
    } catch (err) {
      console.error(err);
      setTreename([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreename();
  }, []);

  const handleEdit = (row) => {
    setSelectedTreename(row);
    setShowEdit(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.treename}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/treename/${row._id}`);
      setTreename((prev) => prev.filter((t) => t._id !== row._id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [{ label: "Tree Name", key: "treename" }];

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2 className="fw-bold">Tree List</h2>
        <input type="text" class="form-control w-25" placeholder="Search BloodgroupRequest..." value=""></input>
       
      </div>

      <CommonTable
        title="Tree List"
        addLabel="+Add Treename"
        columns={columns}
        data={treename}
        onAdd={()=>setShowAdd(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddTreename
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={(newTreename) => setTreename((prev) => [...prev, newTreename])}
      />

      {selectedTreename && (
        <EditTreename
          show={showEdit}
          treename={selectedTreename}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) =>
            setTreename((prev) =>
              prev.map((t) => (t._id === updated._id ? updated : t)),
            )
          }
        />
      )}
    </div>
  );
};

export default ViewTreename;*/
