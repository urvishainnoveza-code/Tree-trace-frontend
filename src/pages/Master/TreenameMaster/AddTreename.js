import React, { useState } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddTreename = ({ show, onClose, onSaved }) => {
  const [formData, setFormData] = useState({ treename: "" });
  const [errors, setErrors] = useState({});

  const fields = [{ label: "Tree Name", name: "treename", required: true }];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.treename.trim()) {
      setErrors({ treename: "Tree name is required" });
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/treename",
        formData,
      );
      onSaved(res.data.data);
      setFormData({ treename: "" });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({
        apiError: err.response?.data?.message || "Failed to save",
      });
    }
  };

  return (
    <CommonModel
      show={show}
      title="Add Treename"
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

      {errors.apiError && <p className="text-danger mt-2">{errors.apiError}</p>}
    </CommonModel>
  );
};

export default AddTreename;
