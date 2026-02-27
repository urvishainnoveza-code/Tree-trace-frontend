import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddArea from "./AddArea";
import EditArea from "./EditArea";

const ViewArea = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  /* ===============================
     Debounce Search
  =============================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ===============================
     Fetch Data
  =============================== */
  const fetchAreas = async (page = 1, search = "") => {
    try {
      setLoading(true);

      const [countriesRes, statesRes, citiesRes, areasRes] =
        await Promise.all([
          axios.get("http://localhost:5000/api/countries"),
          axios.get("http://localhost:5000/api/states"),
          axios.get("http://localhost:5000/api/cities"),
          axios.get(
            `http://localhost:5000/api/areas?page=${page}&limit=${limit}&search=${search}`
          ),
        ]);

      const formattedAreas = areasRes.data.data.map((area) => ({
        _id: area._id,
        areaname: area.areaname,
        cityname: area.city?.cityname || "-",
        statename: area.city?.state?.statename || "-",
        countryname: area.city?.state?.country?.countryname || "-",
      }));

      setCountries(countriesRes.data.data || []);
      setStates(statesRes.data.data || []);
      setCities(citiesRes.data.data || []);
      setAreas(formattedAreas);
      setTotalPages(areasRes.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Trigger Fetch
  =============================== */
  useEffect(() => {
    fetchAreas(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  /* ===============================
     Handlers
  =============================== */
  const handleAddSaved = () => {
    setShowAdd(false);
    fetchAreas(currentPage, debouncedSearch);
  };

  const handleEditClick = (area) => {
    setSelectedArea(area);
    setShowEdit(true);
  };

  const handleEditSaved = () => {
    setShowEdit(false);
    setSelectedArea(null);
    fetchAreas(currentPage, debouncedSearch);
  };

  const handleDelete = async (area) => {
    if (!window.confirm(`Delete "${area.areaname}"?`)) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/areas/${area._id}`
      );
      fetchAreas(currentPage, debouncedSearch);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
    { label: "Area Name", key: "areaname" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Area List</h4>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search Areas (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <CommonTable
        title="Areas"
        addLabel="+ Add Area"
        columns={columns}
        data={areas}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <AddArea
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
        countries={countries}
        states={states}
        cities={cities}
      />

      {selectedArea && (
        <EditArea
          show={showEdit}
          onClose={() => setShowEdit(false)}
          areaData={selectedArea}
          onSaved={handleEditSaved}
          countries={countries}
          states={states}
          cities={cities}
        />
      )}
    </div>
  );
};

export default ViewArea;

/*import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddArea from "./AddArea";
import EditArea from "./EditArea";

const ViewArea = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
const[showAdd, setShowAdd] = useState(false);
  //const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countriesRes, statesRes, citiesRes, areasRes] = await Promise.all([
        axios.get("http://localhost:5000/api/countries"),
        axios.get("http://localhost:5000/api/states"),
        axios.get("http://localhost:5000/api/cities"),
        axios.get("http://localhost:5000/api/areas"),
      ]);

      const countryList = countriesRes.data.data || [];
      const stateList = statesRes.data.data || [];
      const cityList = citiesRes.data.data || [];
      //const areaList = areasRes.data.data || [];

      const mergedAreas = areasRes.data.data.map((area) => {
        const cityObj = area.city || {};
        const stateObj = cityObj.state || {};
        const countryObj = stateObj.country || {};

        return {
          _id: area._id,
          areaname: area.areaname,
          cityname: cityObj.cityname || "-",
          statename: stateObj.statename || "-",
          countryname: countryObj.countryname || "-",
        };
      });

      setCountries(countryList);
      setStates(stateList);
      setCities(cityList);
      setAreas(mergedAreas);
    } catch (err) {
      console.error(err);
      setCountries([]);
      setStates([]);
      setCities([]);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //const handleAddClick = () => setShowAdd(true);
  const handleEditClick = (area) => {
    setSelectedArea(area);
    setShowEditModal(true);
  };

  const handleAddSaved = (newArea) => {
    setAreas((prev) => [...prev, newArea]);
    setShowAdd(false);
  };

  const handleEditSaved = (updatedArea) => {
    setAreas((prev) =>
      prev.map((a) => (a._id === updatedArea._id ? updatedArea : a)),
    );
    setSelectedArea(null);
    setShowEditModal(false);
  };

  const handleDelete = async (area) => {
    if (!window.confirm(`Delete "${area.areaname}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/areas/${area._id}`);
      setAreas((prev) => prev.filter((a) => a._id !== area._id));
    } catch (err) {
      console.error("Error deleting area:", err);
    }
  };

  const columns = [
    { label: "Country Name", key: "countryname" },
    { label: "State Name", key: "statename" },
    { label: "City Name", key: "cityname" },
    { label: "Area Name", key: "areaname" },
  ];

  if (loading) return <div className="p-4">Loading areas...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Area List</h4>
       
      </div>

      <CommonTable
        title="Areas"
        addLabel="+ Add Area"
        columns={columns}
        data={areas}
        onAdd={()=>setShowAdd(true)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      <AddArea
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAddSaved}
        countries={countries}
        states={states}
        cities={cities}
      />

      {selectedArea && (
        <EditArea
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          areaData={selectedArea}
          onSaved={handleEditSaved}
          countries={countries}
          states={states}
          cities={cities}
        />
      )}
    </div>
  );
};

export default ViewArea;*/