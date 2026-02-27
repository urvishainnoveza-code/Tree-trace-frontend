import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddState from "./AddState";
import EditState from "./EditState";

const StateView = () => {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchStates(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/countries");
      setCountries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStates = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/states?page=${page}&limit=${limit}&search=${search}`
      );

      setStates(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (state) => {
    setSelectedState(state);
    setShowEditModal(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.statename}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/states/${row._id}`);
      fetchStates(currentPage, debouncedSearchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">States</h3>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search States (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="State List"
          addLabel="+ Add State"
          columns={columns}
          data={states}
          onAdd={() => setShowAdd(true)}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}

      <AddState
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => fetchStates(currentPage, debouncedSearchQuery)}
        countries={countries}
      />

      {selectedState && (
        <EditState
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          stateData={selectedState}
          onSaved={() => fetchStates(currentPage, debouncedSearchQuery)}
          countries={countries}
        />
      )}
    </div>
  );
};

export default StateView;


/*import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddState from "./AddState";
import EditState from "./EditState";

const StateView = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const fetchData = async () => {
    try {
      const [countriesRes, statesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/countries"),
        axios.get("http://localhost:5000/api/states"),
      ]);

      const countriesArray = countriesRes.data.data || [];
      const statesArray = statesRes.data.data || [];

      const mergedStates = statesArray.map((state) => {
        const country = countriesArray.find(
          (c) => String(c._id) === String(state.country?._id || state.country)
        );
        return { ...state, countryname: country?.countryname || "" };
      });

      setCountries(countriesArray);
      setStates(mergedStates);
    } catch (err) {
      console.error(err);
      setCountries([]);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (state) => {
    setSelectedState(state);
    setShowEditModal(true);
  };

  const handleEditSaved = (updatedState) => {
    setStates(prev =>
      prev.map(s => (s._id === updatedState._id ? updatedState : s))
    );
    setShowEditModal(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.statename}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/states/${row._id}`);
      setStates(prev => prev.filter(s => s._id !== row._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSaved = (newState) => {
    setStates(prev => [...prev, newState]);
    setShowAdd(false);
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
  ];

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">

      <CommonTable
        title="State List"
        addLabel="+ Add State"
        columns={columns}
        data={states}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <AddState
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
        countries={countries}
      />

      {selectedState && (
        <EditState
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          stateData={selectedState}
          onSaved={handleEditSaved}
          countries={countries}
        />
      )}

    </div>
  );
};

export default StateView;*/