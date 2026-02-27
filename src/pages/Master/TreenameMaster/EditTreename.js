import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonModel from "../../../components/common-components/CommonModel";
import CommonForm from "../../../components/common-components/CommonForm";

const EditTreename = ({ show, onClose, treename, onSaved }) => {
  const [formData, setFormData] = useState({ treename: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (treename) {
      setFormData({ treename: treename.treename });
    }
  }, [treename]);

  const handleUpdate = async () => {
    if (!formData.treename.trim()) {
      setErrors({ treename: "Tree name is required" });
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/treename/${treename._id}`,
        formData,
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
      title="Edit Treename"
      onClose={onClose}
      onSave={handleUpdate}
      saveText="Update"
    >
      <CommonForm
        fields={[
          {
            label: "Tree Name",
            name: "treename",
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

      {errors.apiError && <p className="text-danger mt-2">{errors.apiError}</p>}
    </CommonModel>
  );
};

export default EditTreename;
