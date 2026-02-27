import React, { useState } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddCity = ({ show, onClose, onSaved, countries, states }) => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    cityname: "",
  });

  const [errors, setErrors] = useState({});

  const countryOptions = countries.map((c) => ({
    value: c._id,
    label: c.countryname,
  }));

  const filteredStates = states.filter(
    (s) => String(s.country?._id || s.country) === String(formData.country)
  );

  const stateOptions = filteredStates.map((s) => ({
    value: s._id,
    label: s.statename,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      setFormData({ country: value, state: "", cityname: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    let temp = {};
    if (!formData.country) temp.country = "Country is required";
    if (!formData.state) temp.state = "State is required";
    if (!formData.cityname) temp.cityname = "City name is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cities",
        formData
      );

      const selectedCountry = countries.find(
        (c) => c._id === formData.country
      );
      const selectedState = states.find(
        (s) => s._id === formData.state
      );

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
        statename: selectedState?.statename || "",
      });

      setFormData({ country: "", state: "", cityname: "" });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add city");
    }
  };

  const fields = [
    { label: "Country", name: "country", type: "select", options: countryOptions },
    { label: "State", name: "state", type: "select", options: stateOptions },
    { label: "City Name", name: "cityname" },
  ];

  return (
    <CommonModel show={show} title="Add City" onClose={onClose} onSave={handleSubmit}>
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
        errors={errors}
      />
    </CommonModel>
  );
};

export default AddCity;
