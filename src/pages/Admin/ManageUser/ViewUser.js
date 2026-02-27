import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddUser from "./AddUser";

import { useNavigate } from "react-router-dom";


const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });

  const limit = 10;
const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);


  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/auth/users?page=${page}&limit=${limit}&search=${search}`
      );

      const mappedData = res.data.users.map((u) => ({
        ...u,
        area: u.address?.area?.areaname || "",
        city: u.address?.city?.cityname || "",
        state: u.address?.state?.statename || "",
        country: u.address?.country?.countryname || "",
        countryId: u.address?.country?._id || "",
        stateId: u.address?.state?._id || "",
        cityId: u.address?.city?._id || "",
        areaId: u.address?.area?._id || "",
      }));

      setUsers(mappedData);
      setTotalPages(res.data.totalPages || 1);

      /* Build dropdowns dynamically */
      setDropdowns({
        countryId: [
          ...new Map(
            mappedData.map((u) => [
              u.countryId,
              { _id: u.countryId, name: u.country },
            ])
          ).values(),
        ],
        stateId: [
          ...new Map(
            mappedData.map((u) => [
              u.stateId,
              { _id: u.stateId, name: u.state },
            ])
          ).values(),
        ],
        cityId: [
          ...new Map(
            mappedData.map((u) => [
              u.cityId,
              { _id: u.cityId, name: u.city },
            ])
          ).values(),
        ],
        areaId: [
          ...new Map(
            mappedData.map((u) => [
              u.areaId,
              { _id: u.areaId, name: u.area },
            ])
          ).values(),
        ],
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

 
  const filteredUsers = users.filter((u) => {
    if (filters.countryId && u.countryId !== filters.countryId) return false;
    if (filters.stateId && u.stateId !== filters.stateId) return false;
    if (filters.cityId && u.cityId !== filters.cityId) return false;
    if (filters.areaId && u.areaId !== filters.areaId) return false;
    return true;
  });

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.firstName}?`)) return;

    await axios.delete(
      `http://localhost:5000/api/auth/users/${row._id}`
    );

    fetchUsers(currentPage, debouncedSearch);
  };

  const columns = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Area", key: "area" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>User List</h2>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by name (min 3 chars)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["countryId", "stateId", "cityId", "areaId"]}
          onFilterChange={setFilters}
          onClearFilters={() =>
            setFilters({
              countryId: "",
              stateId: "",
              cityId: "",
              areaId: "",
            })
          }
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="User List"
          addLabel="+ Add User"
          columns={columns}
          data={filteredUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onAdd={() => setShowAddUser(true)}
            onDelete={handleDelete}
              onView={(row) => navigate(`/user-profile/${row._id}`)}

        />
      )}

      <AddUser
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSaved={() => fetchUsers(currentPage, debouncedSearch)}
      />
    </div>
  );
};

export default ViewUser;


/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddUser from "./AddUser";

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });

  // -----------------------------
  // Fetch Users
  // -----------------------------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users");
      const data = res.data || [];

      const mappedData = data.map((u) => ({
        ...u,
        area: u.address?.area?.areaname || "",
        city: u.address?.city?.cityname || "",
        state: u.address?.state?.statename || "",
        country: u.address?.country?.countryname || "",
        countryId: u.address?.country?._id || "",
        stateId: u.address?.state?._id || "",
        cityId: u.address?.city?._id || "",
        areaId: u.address?.area?._id || "",
      }));

      setUsers(mappedData);
      setFilteredUsers(mappedData);

      // Create unique dropdown lists
      setDropdowns({
        countryId: [
          ...new Map(
            mappedData.map((u) => [
              u.countryId,
              { _id: u.countryId, name: u.country },
            ])
          ).values(),
        ],
        stateId: [
          ...new Map(
            mappedData.map((u) => [
              u.stateId,
              { _id: u.stateId, name: u.state },
            ])
          ).values(),
        ],
        cityId: [
          ...new Map(
            mappedData.map((u) => [
              u.cityId,
              { _id: u.cityId, name: u.city },
            ])
          ).values(),
        ],
        areaId: [
          ...new Map(
            mappedData.map((u) => [
              u.areaId,
              { _id: u.areaId, name: u.area },
            ])
          ).values(),
        ],
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -----------------------------
  // Apply Filter
  // -----------------------------
  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = users;

    if (selectedFilters.countryId)
      filtered = filtered.filter(
        (u) => u.countryId === selectedFilters.countryId
      );

    if (selectedFilters.stateId)
      filtered = filtered.filter(
        (u) => u.stateId === selectedFilters.stateId
      );

    if (selectedFilters.cityId)
      filtered = filtered.filter(
        (u) => u.cityId === selectedFilters.cityId
      );

    if (selectedFilters.areaId)
      filtered = filtered.filter(
        (u) => u.areaId === selectedFilters.areaId
      );

    setFilteredUsers(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      countryId: "",
      stateId: "",
      cityId: "",
      areaId: "",
    });
    setFilteredUsers(users);
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.firstName}?`)) return;

    await axios.delete(
      `http://localhost:5000/api/auth/users/${row._id}`
    );

    const updated = users.filter((u) => u._id !== row._id);
    setUsers(updated);
    setFilteredUsers(updated);
  };

  // -----------------------------
  // Table Columns
  // -----------------------------
  const columns = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Area", key: "area" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2>User List</h2>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={[
            "countryId",
            "stateId",
            "cityId",
            "areaId",
          ]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CommonTable
          title="User List"
          addLabel="+ Add User"
          columns={columns}
          data={filteredUsers}
          onAdd={() => setShowAddUser(true)}
          onDelete={handleDelete}
        />
      )}

      <AddUser
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSaved={fetchUsers}
      />
    </div>
  );
};

export default ViewUser;*/



/*import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonTable from "../../../components/common-components/CommonTable";
import AddUser from "./AddUser";
import CommonFilter from "../../../components/common-components/CommonFilter";

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });


  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users");

      const data = res.data || [];
      const mappedData = data.map((u) => ({
        
          ...u,
          area: u.address?.area?.areaname || "",
          city: u.address?.city?.cityname || "",
          state: u.address?.state?.statename || "",
          country: u.address?.country?.countryname || "",
          countryId: u.address?.country?._id || "",
          stateId: u.address?.state?._id || "",
          cityId: u.address?.city?._id || "",
          areaId: u.address?.area?._id || "",

        
      }));
      setUsers(mappedData);
      setFilteredUsers(mappedData);

      setDropdowns({
        countryId: [...new Map(mappedData.map(u => [u.countryId, { _id: u.countryId, countryName: u.country }])).values()],
        stateId: [...new Map(mappedData.map(u => [u.stateId, { _id: u.stateId, stateName: u.state }])).values()],
        cityId: [...new Map(mappedData.map(u => [u.cityId, { _id: u.cityId, cityName: u.city }])).values()],
        areaId: [...new Map(mappedData.map(u => [u.areaId, { _id: u.areaId, areaName: u.area }])).values()],
      });



      //setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = users;

    // Apply filters step by step
    if (newFilters.countryId) filtered = filtered.filter(u => u.countryId === newFilters.countryId);
    if (newFilters.stateId) filtered = filtered.filter(u => u.stateId === newFilters.stateId);
    if (newFilters.cityId) filtered = filtered.filter(u => u.cityId === newFilters.cityId);
    if (newFilters.areaId) filtered = filtered.filter(u => u.areaId === newFilters.areaId);

    setFilteredUsers(filtered);
  };

  const handleClearFilters = () => {
    setFilters({ countryId: "", stateId: "", cityId: "", areaId: "" });
    setFilteredUsers(users);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.firstName}?`)) return;

    await axios.delete(`http://localhost:5000/api/auth/users/${row._id}`);
    setUsers((prev) => prev.filter((u) => u._id !== row._id));
  };



  const columns = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Area", key: "area" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Country", key: "country" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>User List</h2>

        <button
          className="btn btn-outline-primary"

          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      
      </div>

      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["countryId", "stateId", "cityId", "areaId"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}


      {loading ? (
        <p>Loading...</p>
      ) : (
          <CommonTable
            title="User List"
            addLabel="Add User"
          columns={columns}
            data={filteredUsers}
            onAdd={() => setShowAddUser(true)}
          onDelete={handleDelete}
        />
      )}

      <AddUser
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSaved={() => fetchUsers()}
      />
    </div>
  );
};

export default ViewUser;*/

