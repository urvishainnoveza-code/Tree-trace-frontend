import React, { useState } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";
import axios from "axios";

const AddState = ({ show, onClose, onSaved, countries }) => {
  const [formData, setFormData] = useState({
    country: "",
    statename: "",
  });
  const [errors, setErrors] = useState({});

  const countryOptions = countries.map((c) => ({
    value: c._id,
    label: c.countryname,
  }));

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    let temp = {};
    if (!formData.country) temp.country = "Country is required";
    if (!formData.statename) temp.statename = "State name is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/states",
        formData
      );

      const selectedCountry = countries.find(
        (c) => c._id === formData.country
      );

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
      });

      setFormData({ country: "", statename: "" });
      setErrors({});
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save state");
    }
  };

  const fields = [
    {
      label: "Country",
      name: "country",
      type: "select",
      required: true,
      options: countryOptions,
    },
    { label: "State Name", name: "statename", required: true },
  ];

  return (
    <CommonModel
      show={show}
      title="Add State"
      onClose={onClose}
      onSave={handleSubmit}
      saveText="Save State"
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
        errors={errors}
      />
    </CommonModel>
  );
};


export default AddState;
