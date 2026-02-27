import React, { useState } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddTree = ({ showModel, setShowModel, onSaved }) => {
  const [values, setValues] = useState({
    treeName: "",
    treeCount: "",
    city: "",
    area: "",
    address: "",
  });

  const trees = [
    { label: "Neem", value: "Neem" },
    { label: "Peepal", value: "Peepal" },
  ];

  const cities = [
    { label: "Surat", value: "Surat" },
    { label: "Ahmedabad", value: "Ahmedabad" },
  ];

  const areas = [
    { label: "Adajan", value: "Adajan" },
    { label: "Maninagar", value: "Maninagar" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newTree = {
      id: Date.now().toString(),
      treeName: values.treeName,
      treeCount: values.treeCount,
      city: values.city,
      area: values.area,
      address: values.address,
      assignedTo: "",
    };

    onSaved(newTree);

    setValues({
      treeName: "",
      treeCount: "",
      city: "",
      area: "",
      address: "",
    });

    setShowModel(false);
  };

  const fields = [
    { label: "Tree Name", name: "treeName", type: "select", options: trees },
    { label: "Tree Count", name: "treeCount", type: "number" },
    { label: "City", name: "city", type: "select", options: cities },
    { label: "Area", name: "area", type: "select", options: areas },
    { label: "Address", name: "address", type: "textarea", rows: 3 },
  ];

  return (
    <CommonModel
      show={showModel}
      title="Add Tree"
      onClose={() => setShowModel(false)}
      onSave={handleSubmit}
      saveText="Save Tree"
    >
      <CommonForm fields={fields} formData={values} onChange={handleChange} />
    </CommonModel>
  );
};

export default AddTree;



/*import React, { useEffect, useState } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";
import axios from "axios";

const AddTree = ({ showModel, setShowModel, onSaved }) => {
  const [values, setValues] = useState({
    treeName: "",
    treeCount: "",
    city: "",
    area: "",
  });

  const [trees, setTrees] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchTrees();
    fetchCities();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/treename");
      setTrees(res.data.data || []);
    } catch (err) {
      console.error("Tree name fetch error:", err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cities");
      setCities(res.data.data || []);
    } catch (err) {
      console.error("City fetch error:", err);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!cityId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/areas/city/${cityId}`,
      );
      setAreas(res.data.data || []);
    } catch (err) {
      console.error("Area fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "city") {
        next.area = "";
        fetchAreas(value);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        treeName: values.treeName,
        treeCount: values.treeCount,
        city: values.city,
        area: values.area,
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/tree/add",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Tree added successfully!");
      setValues({ treeName: "", treeCount: "", city: "", area: "" });
      setShowModel(false);

      if (onSaved) onSaved(res.data.data); // update parent list immediately
    } catch (err) {
      console.error("Add tree error:", err);
      alert("Failed to add tree");
    }
  };

  const sections = [
    {
      title: "Tree Details",
      fields: [
        {
          label: "Tree Name",
          name: "treeName",
          type: "select",
          options: trees.map((t) => ({ label: t.treename, value: t._id })),
        },
        { label: "Tree Count", name: "treeCount", type: "number" },
        {
          label: "City",
          name: "city",
          type: "select",
          options: cities.map((c) => ({ label: c.cityname, value: c._id })),
        },
        {
          label: "Area",
          name: "area",
          type: "select",
          options: areas.map((a) => ({ label: a.areaname, value: a._id })),
        },
      ],
    },
  ];

  return (
    <CommonModel
      show={showModel}
      title="Add Tree Details"
      onClose={() => setShowModel(false)}
      onSave={handleSubmit}
      saveText="Save Tree"
    >
      <CommonForm
        fields={sections[0].fields}
        formData={values}
        onChange={handleChange}
      />
    </CommonModel>
  );
};

export default AddTree;*/
