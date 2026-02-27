import React, { useState, useEffect } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";
import axios from "axios";

const EditState = ({ show, onClose, stateData, onSaved, countries }) => {
  const [formData, setFormData] = useState({
    country: "",
    statename: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (stateData) {
      setFormData({
        country: stateData.country?._id || stateData.country,
        statename: stateData.statename,
      });
    }
  }, [stateData]);

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
      const res = await axios.put(
        `http://localhost:5000/api/states/${stateData._id}`,
        formData
      );

      const selectedCountry = countries.find(
        (c) => c._id === formData.country
      );

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
      });

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
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
      title="Edit State"
      onClose={onClose}
      onSave={handleSubmit}
      saveText="Update State"
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


export default EditState;
