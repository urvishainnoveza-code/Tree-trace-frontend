import React, { useState, useEffect } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTree from "./AddTree";
import EditTreeList from "./EditTreeList";
import AssignTree from "./AssignTree";
import CommonFilter from "../../../components/common-components/CommonFilter";
import "../../../components/common-components/common.css";



const ViewTreeList = () => {
  const initialTrees = [
    { id: 1, treeName: "Oak", treeCount: 10, city: "City A", area: "area1", assignedTo: "User 1" },
    { id: 2, treeName: "Pine", treeCount: 5, city: "City B", area: "area2", assignedTo: "User 2" },
    { id: 3, treeName: "Maple", treeCount: 7, city: "City A", area: "area1", assignedTo: "" },
  ];

  const areaDropdown = [
    { _id: "area1", areaName: "Area 1" },
    { _id: "area2", areaName: "Area 2" },
  ];

  const [allTrees, setAllTrees] = useState(initialTrees);
  const [trees, setTrees] = useState(initialTrees);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length >= 3 || searchQuery.length === 0) {
      const filtered = allTrees.filter((tree) =>
        tree.treeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTrees(filtered);
    }
  }, [searchQuery, allTrees]);

  const handleSaved = (newTree) => {
    const updated = [...allTrees, newTree];
    setAllTrees(updated);
    setTrees(updated);
  };

  const handleFilter = (filters) => {
    let filtered = [...allTrees];

    if (filters.areaId) {
      filtered = filtered.filter((t) => t.area === filters.areaId);
    }

    setTrees(filtered);
  };

  const handleClearFilters = () => {
    setTrees(allTrees);
  };

  const handleDelete = (row) => {
    if (!window.confirm("Delete this tree?")) return;

    const updated = allTrees.filter((t) => t.id !== row.id);
    setAllTrees(updated);
    setTrees(updated);
  };

  const handleEditClick = (row) => {
    setSelectedTree(row);
    setShowEdit(true);
  };

  const handleEditSave = (updatedTree) => {
    const updated = allTrees.map((t) =>
      t.id === updatedTree.id ? updatedTree : t
    );
    setAllTrees(updated);
    setTrees(updated);
    setShowEdit(false);
    setSelectedTree(null);
  };

  const handleAssignClick = (row) => {
    setSelectedTree(row);
    setShowAssign(true);
  };

  const handleAssignSave = (user) => {
    const updated = allTrees.map((t) =>
      t.id === selectedTree.id ? { ...t, assignedTo: user } : t
    );
    setAllTrees(updated);
    setTrees(updated);
    setShowAssign(false);
    setSelectedTree(null);
  };

  const columns = [
    { label: "Tree Name", key: "treeName" },
    { label: "Count", key: "treeCount" },
    { label: "City", key: "city" },
    { label: "Area", key: "area" },
    { label: "Assigned To", key: "assignedTo" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>Tree List</h2>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            {showFilter ? "Hide Filter" : "Show Filter"}
          </button>

          <input
    type="text"
    className="form-control ms-auto"
    style={{ width: "250px" }}
    placeholder="Search Trees..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
        </div>
      </div>

      {showFilter && (
        <CommonFilter
          dropdowns={{ areaId: areaDropdown }}
          onFilterChange={handleFilter}
          onClearFilters={handleClearFilters}
          filtersToShow={["areaId"]}
        />
      )}

      <CommonTable
        title="Tree List"
        addLabel="+ Add Tree"
        columns={columns}
        data={trees}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onAssign={handleAssignClick}
      />

      <AddTree
        showModel={showAdd}
        setShowModel={setShowAdd}
        onSaved={handleSaved}
      />

      {selectedTree && (
        <EditTreeList
          show={showEdit}
          tree={selectedTree}
          onClose={() => setShowEdit(false)}
          onSaved={handleEditSave}
        />
      )}

      {selectedTree && (
        <AssignTree
          show={showAssign}
          tree={selectedTree}
          onClose={() => setShowAssign(false)}
          onSaved={handleAssignSave}
        />
      )}
    </div>
  );
};

export default ViewTreeList;

/*import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTree from "./AddTree";
import EditTreeList from "./EditTreeList";
import AssignTree from "./AssignTree";
import CommonFilter from "../../../components/common-components/CommonFilter";
import "../../../components/common-components/common.css";

const ViewTreeList = () => {
  // State
  const [allTrees, setAllTrees] = useState([]); // all trees for filtering
  const [trees, setTrees] = useState([]);       // displayed trees
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [areas, setAreas] = useState([]); // dropdown for area filter

  // Fetch initial data
  useEffect(() => {
    fetchTrees();
    fetchAreas();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await axios.get("/api/trees"); // backend API endpoint
      setAllTrees(res.data);
      setTrees(res.data);
    } catch (err) {
      console.error("Failed to fetch trees:", err);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await axios.get("/api/areas"); // backend API endpoint for dropdown
      setAreas(res.data);
    } catch (err) {
      console.error("Failed to fetch areas:", err);
    }
  };

  // Add tree
  const handleSaved = async (newTreeData) => {
    try {
      const res = await axios.post("/api/trees", newTreeData);
      const savedTree = res.data;
      setAllTrees((prev) => [...prev, savedTree]);
      setTrees((prev) => [...prev, savedTree]);
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to add tree:", err);
    }
  };

  // Edit tree
  const handleEditSave = async (updatedTree) => {
    try {
      const res = await axios.put(`/api/trees/${updatedTree.id}`, updatedTree);
      const updated = res.data;
      const updatedAll = allTrees.map((t) => (t.id === updated.id ? updated : t));
      setAllTrees(updatedAll);
      setTrees(updatedAll);
      setShowEdit(false);
      setSelectedTree(null);
    } catch (err) {
      console.error("Failed to update tree:", err);
    }
  };

  // Delete tree
  const handleDelete = async (row) => {
    if (!window.confirm("Delete this tree?")) return;
    try {
      await axios.delete(`/api/trees/${row.id}`);
      const updatedTrees = allTrees.filter((t) => t.id !== row.id);
      setAllTrees(updatedTrees);
      setTrees(updatedTrees);
    } catch (err) {
      console.error("Failed to delete tree:", err);
    }
  };

  // Assign tree
  const handleAssignSave = async (user) => {
    try {
      const res = await axios.patch(`/api/trees/${selectedTree.id}/assign`, { assignedTo: user });
      const updated = res.data;
      const updatedAll = allTrees.map((t) => (t.id === updated.id ? updated : t));
      setAllTrees(updatedAll);
      setTrees(updatedAll);
      setShowAssign(false);
      setSelectedTree(null);
    } catch (err) {
      console.error("Failed to assign tree:", err);
    }
  };

  // Filter trees (frontend filter)
  const handleFilter = (filters) => {
    let filtered = [...allTrees];
    if (filters.areaId) {
      filtered = filtered.filter((t) => t.area === filters.areaId);
    }
    setTrees(filtered);
  };

  const handleClearFilters = () => {
    setTrees(allTrees);
  };

  const columns = [
    { label: "Tree Name", key: "treeName" },
    { label: "Count", key: "treeCount" },
    { label: "City", key: "city" },
    { label: "Area", key: "area" },
    { label: "Assigned To", key: "assignedTo" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>Tree List</h2>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <CommonFilter
          dropdowns={{ areaId: areas }}
          onFilterChange={handleFilter}
          onClearFilters={handleClearFilters}
          filtersToShow={["areaId"]}
        />
      )}

      <CommonTable
        title="Tree List"
        addLabel="+ Add Tree"
        columns={columns}
        data={trees}
        onAdd={() => setShowAdd(true)}
        onEdit={(row) => { setSelectedTree(row); setShowEdit(true); }}
        onDelete={handleDelete}
        onAssign={(row) => { setSelectedTree(row); setShowAssign(true); }}
      />

      <AddTree showModel={showAdd} setShowModel={setShowAdd} onSaved={handleSaved} />

      {selectedTree && (
        <EditTreeList
          show={showEdit}
          tree={selectedTree}
          onClose={() => setShowEdit(false)}
          onSaved={handleEditSave}
        />
      )}

      {selectedTree && (
        <AssignTree
          show={showAssign}
          tree={selectedTree}
          onClose={() => setShowAssign(false)}
          onSaved={handleAssignSave}
        />
      )}
    </div>
  );
};

export default ViewTreeList;*/


/*import React, { useEffect, useState } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTree from "./AddTree";
import EditTreeList from "./EditTreeList";
import AssignTree from "./AssignTree";

const ViewTreeList = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);

  const users = [
    { _id: "u1", name: "User One", area: "Adajan" },
    { _id: "u3", name: "User Three", area: "Adajan" },
  ];

  // fake fetch
  useEffect(() => {
    const fakeTrees = [
      {
        _id: "1",
        treeName: "Neem",
        treeCount: 20,
        city: { cityname: "Surat" },
        area: { areaname: "Adajan" },
        assignedTo: "",
      },
    ];
    setTrees(fakeTrees);
    setLoading(false);
  }, []);

  // actions
  const handleDelete = (tree) => {
    if (!window.confirm(`Delete "${tree.treeName}"?`)) return;
    setTrees(prev => prev.filter(t => t._id !== tree._id));
  };

  const handleAddSave = (newTree) => {
    setTrees(prev => [...prev, newTree]);
    setShowAdd(false);
  };

  const handleEditSave = (updatedTree) => {
    setTrees(prev =>
      prev.map(t => (t._id === updatedTree._id ? updatedTree : t))
    );
    setShowEdit(false);
    setSelectedTree(null);
  };

  const handleAssignSave = (userId) => {
    setTrees(prev =>
      prev.map(t =>
        t._id === selectedTree._id
          ? { ...t, assignedTo: userId }
          : t
      )
    );
    setShowAssign(false);
    setSelectedTree(null);
  };

  if (loading) return <p>Loading...</p>;

  // group by area
  const groupedTrees = trees.reduce((acc, tree) => {
    const area = tree.area.areaname;
    if (!acc[area]) acc[area] = [];
    acc[area].push(tree);
    return acc;
  }, {});

  return (
    <div className="p-4">
      {Object.keys(groupedTrees).map(area => (
        <div key={area} className="mb-5">
          <h4 className="mb-3">Area: {area}</h4>

          <CommonTable
            title="Tree List"
            addLabel="+ Add Tree"
            columns={[
              { label: "Tree Name", key: "treeName" },
              { label: "Tree Count", key: "treeCount" },
              { label: "City", key: "city.cityname" },
              { label: "Assigned To", key: "assignedTo" },
            ]}
            data={groupedTrees[area]}
            onAdd={() => setShowAdd(true)}
            onEdit={(tree) => {
              setSelectedTree(tree);
              setShowEdit(true);
            }}
            onDelete={handleDelete}
            onAssign={(tree) => {
              setSelectedTree(tree);
              setShowAssign(true);
            }}
          />
        </div>
      ))}

      {showAdd && (
        <AddTree
          show={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={handleAddSave}
        />
      )}

      {showEdit && selectedTree && (
        <EditTreeList
          show={showEdit}
          onClose={() => setShowEdit(false)}
          tree={selectedTree}
          onSaved={handleEditSave}
        />
      )}

      {showAssign && selectedTree && (
        <AssignTree
          show={showAssign}
          onClose={() => setShowAssign(false)}
          tree={selectedTree}
          users={users}
          onAssign={handleAssignSave}
        />
      )}
    </div>
  );
};

export default ViewTreeList;*/



/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddTree from "./AddTree";
import EditTreeList from "./EditTreeList";

const ViewTreeList = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);

  const fetchTrees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tree");
      setTrees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching trees:", err);
      setTrees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const handleEdit = (row) => {
    setSelectedTree(row);
    setShowEdit(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete tree ${row.treeName}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tree/${row._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrees((prev) => prev.filter((t) => t._id !== row._id));
      alert("Tree deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete tree");
    }
  };

  const columns = [
    { label: "Tree Name", key: "treeName" },
    { label: "Tree Count", key: "treeCount" },
    { label: "City", key: "city.cityname" },
    { label: "Area", key: "area.areaname" },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2 className="fw-bold">Tree List</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Tree
        </button>
      </div>

      <CommonTable
        columns={columns}
        data={trees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showAdd && (
        <AddTree
          showModel={showAdd}
          setShowModel={setShowAdd}
          onSaved={(newTree) => setTrees((prev) => [...prev, newTree])}
        />
      )}

      {showEdit && selectedTree && (
        <EditTreeList
          showModel={showEdit}
          setShowModel={setShowEdit}
          tree={selectedTree}
          onSaved={(updatedTree) =>
            setTrees((prev) =>
              prev.map((t) => (t._id === updatedTree._id ? updatedTree : t)),
            )
          }
        />
      )}
    </div>
  );
};

export default ViewTreeList;*/
