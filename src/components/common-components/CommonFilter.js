import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2/dist/css/select2.min.css";
import "select2";
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

  // Ref for Area select
  const areaSelectRef = useRef();

  // Initialize Select2 only for Area filter
  useEffect(() => {
    const areaSelect = areaSelectRef.current;
    if (filtersToShow.includes("areaId") && areaSelect) {
      $(areaSelect).select2({
        width: "resolve",
        placeholder: `All ${labelsMap["areaId"]}`,
        className: "common-index-font14",
        allowClear: true,
      });
      // Sync value if changed externally
      $(areaSelect).on("change", function (e) {
        handleChange("areaId", e.target.value);
      });
    }
    return () => {
      if (areaSelect) {
        $(areaSelect).off("change");
        $(areaSelect).select2("destroy");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersToShow, dropdowns.areaId]);

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
    <div className="common-filter-container d-flex align-items-center gap-2 flex-wrap">
      {filtersToShow.map((key) => (
        <div className="common-filter-item" key={key}>
          {/* Dropdown Fields */}
          {optionsMap[key] ? (
            key === "areaId" ? (
              <select
                ref={areaSelectRef}
                className="form-select user-filter-select common-index-font14 area-select2"
                value={selectedFilters[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option className="common-index-font14" value="">
                  All {labelsMap[key]}
                </option>
                {optionsMap[key].map((item) => (
                  <option
                    key={item?._id || item?.id || item?.value || String(item)}
                    value={item?._id || item?.id || item?.value || ""}
                  >
                    {item?.name ||
                      item?.treeName ||
                      item?.areaName ||
                      item?.areaname ||
                      (typeof item === "string" ? item : "N/A")}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="form-select user-filter-select common-index-font14"
                value={selectedFilters[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option className="common-index-font14" value="">
                  All {labelsMap[key]}
                </option>
                {optionsMap[key].map((item) => (
                  <option
                    key={item?._id || item?.id || item?.value || String(item)}
                    value={item?._id || item?.id || item?.value || ""}
                  >
                    {item?.name ||
                      item?.treeName ||
                      item?.areaName ||
                      item?.areaname ||
                      (typeof item === "string" ? item : "N/A")}
                  </option>
                ))}
              </select>
            )
          ) : null}
          {key === "date" ? (
            <input
              type="date"
              className="form-control user-search-input common-index-font14"
              value={selectedFilters[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ) : null}
        </div>
      ))}
      <div className="common-filter-actions d-flex gap-2 common-index-font14">
        <button
          className="btn btn-success user-filter-btn common-index-font14"
          onClick={handleApply}
        >
          Apply
        </button>
        <button
          className="btn btn-secondary user-filter-btn common-index-font14"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CommonFilter;
