import React, { useState, useEffect } from "react";
import "./common.css";

const CommonFilter = ({
  filters = {},
  dropdowns = {},
  onFilterChange,
  onClearFilters,
  filtersToShow = [], // control which filters visible
}) => {
  const defaultFilters = {
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
    treeId: "",
    status: "",
    date: "",
    startDate: "",
    endDate: "",
  };

  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);

  // Sync with parent filters
  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  }, [filters]);

  const handleChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onFilterChange(selectedFilters);
  };

  const handleClear = () => {
    setSelectedFilters(defaultFilters);
    onClearFilters();
  };

  const optionsMap = {
    countryId: dropdowns.countryId || [],
    stateId: dropdowns.stateId || [],
    cityId: dropdowns.cityId || [],
    areaId: dropdowns.areaId || [],
    treeId: dropdowns.treeId || [],
    status: dropdowns.status || [],
  };

  const labelsMap = {
    countryId: "Country",
    stateId: "State",
    cityId: "City",
    areaId: "Area",
    treeId: "Tree",
    status: "Status",
    date: "Date",
    startDate: "Start Date",
    endDate: "End Date",
  };

  return (
    <div className="common-filter-container">
      {filtersToShow.map((key) => (
        <div className="common-filter-item" key={key}>
          <label>{labelsMap[key]}</label>

          {/* Dropdown Fields */}
          {optionsMap[key] ? (
            <select
              value={selectedFilters[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              <option value="">All {labelsMap[key]}</option>
              {optionsMap[key].map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name || item.treeName || item.areaName || "N/A"}
                </option>
              ))}
            </select>
          ) : null}

          {/* Date Fields */}
          {key === "date" || key === "startDate" || key === "endDate" ? (
            <input
              type="date"
              value={selectedFilters[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ) : null}
        </div>
      ))}

      <div className="common-filter-actions">
        <button className="common-filter-button" onClick={handleApply}>
          Apply
        </button>
        <button className="common-filter-button clear" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default CommonFilter;
