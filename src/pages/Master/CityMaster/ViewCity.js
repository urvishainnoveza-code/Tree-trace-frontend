import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddCity from "./AddCity";
import EditCity from "./EditCity";

const ViewCity = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  /* ==============================
     Debounce Search
  ============================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ==============================
     Fetch Data
  ============================== */
  const fetchCities = async (page = 1, search = "") => {
    try {
      setLoading(true);

      const [countriesRes, statesRes, citiesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/countries"),
        axios.get("http://localhost:5000/api/states"),
        axios.get(
          `http://localhost:5000/api/cities?page=${page}&limit=${limit}&search=${search}`
        ),
      ]);

      const countryList = countriesRes.data.data || [];
      const stateList = statesRes.data.data || [];
      const cityList = citiesRes.data.data || [];

      const formattedCities = cityList.map((city) => ({
        _id: city._id,
        cityname: city.cityname,
        statename: city.state?.statename || "-",
        countryname: city.state?.country?.countryname || "-",
      }));

      setCountries(countryList);
      setStates(stateList);
      setCities(formattedCities);
      setTotalPages(citiesRes.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     Trigger Fetch
  ============================== */
  useEffect(() => {
    fetchCities(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  /* ==============================
     Handlers
  ============================== */
  const handleAddSaved = () => {
    setShowAdd(false);
    fetchCities(currentPage, debouncedSearch);
  };

  const handleEditClick = (city) => {
    setSelectedCity(city);
    setShowEdit(true);
  };

  const handleEditSaved = () => {
    setShowEdit(false);
    setSelectedCity(null);
    fetchCities(currentPage, debouncedSearch);
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Delete "${city.cityname}"?`)) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/cities/${city._id}`
      );
      fetchCities(currentPage, debouncedSearch);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /* ==============================
     Table Columns
  ============================== */
  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
  ];

  /* ==============================
     UI
  ============================== */
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">City List</h3>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search Cities (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <CommonTable
        title="Cities"
        addLabel="+ Add City"
        columns={columns}
        data={cities}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {/* Add Modal */}
      <AddCity
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
        countries={countries}
        states={states}
      />

      {/* Edit Modal */}
      {selectedCity && (
        <EditCity
          show={showEdit}
          onClose={() => setShowEdit(false)}
          cityData={selectedCity}
          onSaved={handleEditSaved}
          countries={countries}
          states={states}
        />
      )}
    </div>
  );
};

export default ViewCity;

/*import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddCity from "./AddCity";
import EditCity from "./EditCity";

const CityView = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const[showAdd, setShowAdd] = useState(false);

  //const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countriesRes, statesRes, citiesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/countries"),
        axios.get("http://localhost:5000/api/states"),
        axios.get("http://localhost:5000/api/cities"),
      ]);

      const countryList = countriesRes.data.data || countriesRes.data || [];
      const stateList = statesRes.data.data || statesRes.data || [];
      const cityList = citiesRes.data.data || citiesRes.data || [];

      const mergedCities = cityList.map((city) => {
        const stateObj = city.state;
        const countryObj = stateObj?.country;

        return {
          _id: city._id,
          cityname: city.cityname,
          statename: stateObj?.statename || "-",
          countryname: countryObj?.countryname || "-",
        };
      });

      setCountries(countryList);
      setStates(stateList);
      setCities(mergedCities);
    } catch (err) {
      console.error("Error fetching city data:", err);
      setCountries([]);
      setStates([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //const handleAddClick = () => setShowAdd(true);
  const handleEditClick = (city) => {
    setSelectedCity(city);
    setShowEditModal(true);
  };
  const handleAddSaved = (newCity) => {
    setCities((prev) => [...prev, newCity]);
    setShowAdd(false);
  };
  const handleEditSaved = (updatedCity) => {
    setCities((prev) =>
      prev.map((c) => (c._id === updatedCity._id ? updatedCity : c))
    );
    setShowEditModal(false);
    setSelectedCity(null);
  };
  const handleDelete = async (city) => {
    if (!window.confirm(`Delete "${city.cityname}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/cities/${city._id}`);
      setCities((prev) => prev.filter((c) => c._id !== city._id));
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
  ];

  if (loading) return <div className="p-4">Loading cities...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>City List</h4>

      </div>

      <CommonTable
        title="Cities"
        addLabel="+ Add Cities"
        columns={columns}
        data={cities}
        onAdd={()=> setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <AddCity
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
        countries={countries}
        states={states}
      />

      {selectedCity && (
        <EditCity
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          cityData={selectedCity}
          onSaved={handleEditSaved}
          countries={countries}
          states={states}
        />
      )}
    </div>
  );
};

export default CityView;*/
