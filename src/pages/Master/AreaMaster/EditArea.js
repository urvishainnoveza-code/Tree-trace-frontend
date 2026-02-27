import React, { useState, useEffect } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const EditArea = ({ show, onClose, areaData, onSaved, countries, states, cities }) => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    areaname: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (areaData) {
      setFormData({
        country: areaData.country?._id || areaData.country,
        state: areaData.state?._id || areaData.state,
        city: areaData.city?._id || areaData.city,
        areaname: areaData.areaname,
      });
    }
  }, [areaData]);

  const countryOptions = countries.map((c) => ({ value: c._id, label: c.countryname }));
  const stateOptions = states
    .filter((s) => s.country === formData.country || s.country?._id === formData.country)
    .map((s) => ({ value: s._id, label: s.statename }));
  const cityOptions = cities
    .filter((c) => c.state === formData.state || c.state?._id === formData.state)
    .map((c) => ({ value: c._id, label: c.cityname }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") setFormData({ ...formData, country: value, state: "", city: "" });
    else if (name === "state") setFormData({ ...formData, state: value, city: "" });
    else setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let temp = {};
    if (!formData.country) temp.country = "Country is required";
    if (!formData.state) temp.state = "State is required";
    if (!formData.city) temp.city = "City is required";
    if (!formData.areaname) temp.areaname = "Area name is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/areas/${areaData._id}`, formData);

      const selectedCountry = countries.find((c) => c._id === formData.country);
      const selectedState = states.find((s) => s._id === formData.state);
      const selectedCity = cities.find((c) => c._id === formData.city);

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
        statename: selectedState?.statename || "",
        cityname: selectedCity?.cityname || "",
      });

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update area");
    }
  };

  const fields = [
    { label: "Country", name: "country", type: "select", options: countryOptions },
    { label: "State", name: "state", type: "select", options: stateOptions },
    { label: "City", name: "city", type: "select", options: cityOptions },
    { label: "Area Name", name: "areaname" },
  ];

  return (
    <CommonModel show={show} title="Edit Area" onClose={onClose} onSave={handleSubmit}>
      <CommonForm fields={fields} formData={formData} onChange={handleChange} errors={errors} />
    </CommonModel>
  );
};

export default EditArea;
