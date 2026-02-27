import React, { useEffect, useState } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import "../../../components/common-components/common.css";

const ViewTask = () => {
  const [trees, setTrees] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    areaId: "",
  });

  const [dropdowns, setDropdowns] = useState({
    areaId: [],
  });

  // ---------------------------------
  // Load Fake Data
  // ---------------------------------
  useEffect(() => {
    const fakeTrees = [
      {
        _id: "1",
        treeName: "Neem",
        treeCount: 20,
        city: { _id: "c1", cityname: "Surat" },
        area: { _id: "a1", areaname: "Adajan" },
      },
      {
        _id: "2",
        treeName: "Peepal",
        treeCount: 10,
        city: { _id: "c2", cityname: "Ahmedabad" },
        area: { _id: "a2", areaname: "Maninagar" },
      },
    ];

    setTrees(fakeTrees);
    setAllTrees(fakeTrees);

    // Create unique area dropdown
    const uniqueAreas = [
      ...new Map(
        fakeTrees.map((t) => [
          t.area._id,
          { _id: t.area._id, name: t.area.areaname },
        ])
      ).values(),
    ];

    setDropdowns({
      areaId: uniqueAreas,
    });
  }, []);

  // ---------------------------------
  // Apply Filter
  // ---------------------------------
  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = [...allTrees];

    if (selectedFilters.areaId) {
      filtered = filtered.filter(
        (t) => t.area._id === selectedFilters.areaId
      );
    }

    setTrees(filtered);
  };

  // ---------------------------------
  // Clear Filter
  // ---------------------------------
  const handleClearFilters = () => {
    setFilters({ areaId: "" });
    setTrees(allTrees);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Tree List</h2>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filter" : "Show Filter"}
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <CommonFilter
          filters={filters}
          dropdowns={dropdowns}
          filtersToShow={["areaId"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Table */}
      <CommonTable
        columns={[
          { label: "Tree Name", key: "treeName" },
          { label: "Tree Count", key: "treeCount" },
          { label: "City", key: "city.cityname" },
          { label: "Area", key: "area.areaname" },
        ]}
        data={trees}
      />
    </div>
  );
};

export default ViewTask;

