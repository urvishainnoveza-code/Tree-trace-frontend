import React, { useState, useEffect } from "react";
import CommonTable from "../../../components/common-components/CommonTable";
import CommonFilter from "../../../components/common-components/CommonFilter";
import AddTreeDetail from "./AddTreeDetail";
import { useNavigate } from "react-router-dom";



const ViewTreeDetail = () => {
  const [treeDetail, setTreeDetail] = useState([]);
  const [allTreeDetail, setAllTreeDetail] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTreeDetail, setSelectedTreeDetail] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    treeId: "",
    countryId: "",
    stateId: "",
    cityId: "",
    areaId: "",
    startDate: "",
    endDate: "",
    onView: "",
  });

  const [dropdowns, setDropdowns] = useState({
    treeId: [],
    countryId: [],
    stateId: [],
    cityId: [],
    areaId: [],
  });

const navigate = useNavigate();

  useEffect(() => {
    const fakeData = [
      {
        _id: "1",
        treename: "Neem",
        country: "India",
        state: "Gujarat",
        city: "Surat",
        area: "Adajan",
        cage: "Yes",
        watering: "Daily",
        date: "2026-02-10",
        photo: "image1.jpg",
      },
      {
        _id: "2",
        treename: "Peepal",
        country: "India",
        state: "Gujarat",
        city: "Ahmedabad",
        area: "Maninagar",
        cage: "No",
        watering: "Weekly",
        date: "2026-02-05",
        photo: "image2.jpg",
      },
    ];

    setTreeDetail(fakeData);
    setAllTreeDetail(fakeData);

    const unique = (key) =>
      [...new Map(fakeData.map((i) => [i[key], { _id: i[key], name: i[key] }])).values()];

    setDropdowns({
      treeId: unique("treename"),
      countryId: unique("country"),
      stateId: unique("state"),
      cityId: unique("city"),
      areaId: unique("area"),
    });
  }, []);

  const handleFilterChange = (selectedFilters) => {
    setFilters(selectedFilters);

    let filtered = [...allTreeDetail];

    if (selectedFilters.treeId)
      filtered = filtered.filter((t) => t.treename === selectedFilters.treeId);

    if (selectedFilters.countryId)
      filtered = filtered.filter((t) => t.country === selectedFilters.countryId);

    if (selectedFilters.stateId)
      filtered = filtered.filter((t) => t.state === selectedFilters.stateId);

    if (selectedFilters.cityId)
      filtered = filtered.filter((t) => t.city === selectedFilters.cityId);

    if (selectedFilters.areaId)
      filtered = filtered.filter((t) => t.area === selectedFilters.areaId);

    if (selectedFilters.startDate)
      filtered = filtered.filter((t) => t.date >= selectedFilters.startDate);

    if (selectedFilters.endDate)
      filtered = filtered.filter((t) => t.date <= selectedFilters.endDate);

    setTreeDetail(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      treeId: "",
      countryId: "",
      stateId: "",
      cityId: "",
      areaId: "",
      startDate: "",
      endDate: "",
    });
    setTreeDetail(allTreeDetail);
  };


  const handleEdit = (row) => {
    setSelectedTreeDetail(row);
    setShowEdit(true);
  };

  const handleDelete = (row) => {
    const updated = treeDetail.filter((td) => td !== row);
    setTreeDetail(updated);
    setAllTreeDetail(updated);
  };



  const columns = [
    { label: "Treename", key: "treename" },
    { label: "Country", key: "country" },
    { label: "State", key: "state" },
    { label: "City", key: "city" },
    { label: "Area", key: "area" },
    { label: "Cage", key: "cage" },
    { label: "Watering", key: "watering" },
    { label: "Date", key: "date" },
    { label: "Photo", key: "photo" },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h2 className="fw-bold">Tree Detail List</h2>

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
            "treeId",
            "countryId",
            "stateId",
            "cityId",
            "areaId",
            "startDate",
            "endDate",
          ]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <CommonTable
        title="Tree Detail List"
        addLabel="+ Add Tree Detail"
        columns={columns}
        data={treeDetail}
        onAdd={() => setShowAdd(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={(row)=>navigate(`/tree-profile/${row._id}`)}
      />

      <AddTreeDetail
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={(newTree) => {
          setTreeDetail((prev) => [...prev, newTree]);
          setAllTreeDetail((prev) => [...prev, newTree]);
        }}
      />

      <AddTreeDetail
        show={showEdit}
        initialData={selectedTreeDetail}
        onClose={() => setShowEdit(false)}
        onSaved={(updatedTree) =>
          setTreeDetail((prev) =>
            prev.map((td) =>
              td === selectedTreeDetail ? updatedTree : td
            )
          )
        }
      />
    </div>
  );
};

export default ViewTreeDetail;
