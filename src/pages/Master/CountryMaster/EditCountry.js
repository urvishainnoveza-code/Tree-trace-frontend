import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonModel from "../../../components/common-components/CommonModel";
import CommonForm from "../../../components/common-components/CommonForm";

const EditCountry = ({ show, onClose, country, onSaved }) => {
  const [formData, setFormData] = useState({ countryname: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (country) {
      setFormData({ countryname: country.countryname });
    }
  }, [country]);

  const handleUpdate = async () => {
    if (!formData.countryname.trim()) {
      setErrors({ countryname: "Country name is required" });
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/countries/${country._id}`,
        formData
      );
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      setErrors({ apiError: "Update failed" });
    }
  };

  return (
    <CommonModel
      show={show}
      title="Edit Country"
      onClose={onClose}
      onSave={handleUpdate}
      saveText="Update"
    >
      <CommonForm
        fields={[
          {
            label: "Country Name",
            name: "countryname",
            required: true,
          },
        ]}
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

export default EditCountry;
