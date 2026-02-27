import React, { useState, useEffect } from "react";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const EditTreeList = ({ show, tree, onClose, onSaved }) => {
  const [values, setValues] = useState(tree);

  useEffect(() => {
    setValues(tree);
  }, [tree]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSaved(values);
  };

  const fields = [
    { label: "Tree Name", name: "treeName", type: "text" },
    { label: "Tree Count", name: "treeCount", type: "number" },
    { label: "City", name: "city", type: "text" },
    { label: "Area", name: "area", type: "text" },
    { label: "Address", name: "address", type: "textarea", rows: 3 },
  ];

  return (
    <CommonModel
      show={show}
      title="Edit Tree"
      onClose={onClose}
      onSave={handleSubmit}
      saveText="Update"
    >
      <CommonForm fields={fields} formData={values} onChange={handleChange} />
    </CommonModel>
  );
};

export default EditTreeList;
