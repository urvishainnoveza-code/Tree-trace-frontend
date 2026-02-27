import React, { useState, useEffect } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

// ✅ Move Outside Component
const defaultData = {
  treename: "neem",
  country: "India",
  state: "Gujarat",
  city: "Gondal",
  area: "jetpur road",
  cage: "",
  watering: "",
  date: "",
  image: ""
};

const AddTreeDetail = ({ show, onClose, onSaved, initialData }) => {

  const [formData, setFormData] = useState(defaultData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultData);
    }
  }, [initialData, show]); // ✅ Now no warning

  const fields = [
    { label: "Treename", name: "treename", required: true },
    { label: "Country", name: "country" },
    { label: "State", name: "state" },
    { label: "City", name: "city" },
    { label: "Area", name: "area" },
    {
      label: "Cage",
      name: "cage",
      type: "radio",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      label: "Watering",
      name: "watering",
      type: "radio",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    { label: "Date", name: "date", type: "date" },
    { label: "Image", name: "image", type: "file" },
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = () => {
    onSaved(formData);
    onClose();
  };

  return (
    <CommonModel
      show={show}
      title="Tree Detail"
      onClose={onClose}
      onSave={handleSubmit}
      saveText="Save"
    >
      <CommonForm
        fields={fields}
        formData={formData}
        onChange={handleChange}
      />
    </CommonModel>
  );
};

export default AddTreeDetail;
