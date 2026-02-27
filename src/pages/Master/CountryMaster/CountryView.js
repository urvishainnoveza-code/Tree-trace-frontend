import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddCountry from "./AddCountry";
import EditCountry from "./EditCountry";

const CountryView = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

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
    fetchCountries(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  const fetchCountries = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/countries?page=${page}&limit=${limit}&search=${search}`
      );

      setCountries(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setSelectedCountry(row);
    setShowEdit(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.countryname}?`)) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/countries/${row._id}`
      );
      fetchCountries(currentPage, debouncedSearchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [{ label: "Country Name", key: "countryname" }];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Countries</h3>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search Countries (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="Country List"
          addLabel="+ Add Country"
          columns={columns}
          data={countries}
          onAdd={() => setShowAdd(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
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
          </nav>
        </div>
      )}

      <AddCountry
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => fetchCountries(currentPage, debouncedSearchQuery)}
      />

      {selectedCountry && (
        <EditCountry
          show={showEdit}
          country={selectedCountry}
          onClose={() => setShowEdit(false)}
          onSaved={() => fetchCountries(currentPage, debouncedSearchQuery)}
        />
      )}
    </div>
  );
};

export default CountryView;

/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddCountry from "./AddCountry";
import EditCountry from "./EditCountry";

const CountryView = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // fetch
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/countries");
      setCountries(res.data.data || []);
    } catch (err) {
      console.error(err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // edit
  const handleEdit = (row) => {
    setSelectedCountry(row);
    setShowEdit(true);
  };

  // delete
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.countryname}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/countries/${row._id}`);
      setCountries(prev => prev.filter(c => c._id !== row._id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
  ];

  return (
    <div className="p-4">

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="Country List"
          addLabel="+ Add Country"
          columns={columns}
          data={countries}
          onAdd={() => setShowAdd(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AddCountry
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={(newCountry) =>
          setCountries(prev => [...prev, newCountry])
        }
      />

      {selectedCountry && (
        <EditCountry
          show={showEdit}
          country={selectedCountry}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) =>
            setCountries(prev =>
              prev.map(c =>
                c._id === updated._id ? updated : c
              )
            )
          }
        />
      )}

    </div>
  );
};

export default CountryView;*/