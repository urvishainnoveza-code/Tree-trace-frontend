import React, { useState } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddCountry = ({ show, onClose, onSaved }) => {
  const [formData, setFormData] = useState({ countryname: "" });
  const [errors, setErrors] = useState({});

  const fields = [
    { label: "Country Name", name: "countryname", required: true },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.countryname.trim()) {
      setErrors({ countryname: "Country name is required" });
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/countries",
        formData
      );
      onSaved(res.data.data);
      setFormData({ countryname: "" });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({
        apiError:
          err.response?.data?.message || "Failed to save",
      });
    }
  };

  return (
    <CommonModel
      show={show}
      title="Add Country"
      onClose={onClose}
      onSave={handleSubmit}
      saveText="Save"
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={(e) =>
          setFormData({
            ...formData,
            [e.target.name]: e.target.value,
          })
        }
        errors={errors}
      />

      {errors.apiError && (
        <p className="text-danger mt-2">{errors.apiError}</p>
      )}
    </CommonModel>
  );
};

export default AddCountry;
