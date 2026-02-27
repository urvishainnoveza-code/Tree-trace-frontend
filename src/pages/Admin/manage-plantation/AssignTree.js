import React, { useState } from "react";
import CommonModel from "../../../components/common-components/CommonModel";

const AssignTree = ({ show, tree, onClose, onSaved }) => {
  const [user, setUser] = useState("");

  const users = ["Worker A", "Worker B", "Worker C"];

  const handleAssign = () => {
    onSaved(user);
  };

  return (
    <CommonModel
      show={show}
      title={`Assign Tree: ${tree.treeName}`}
      onClose={onClose}
      onSave={handleAssign}
      saveText="Assign"
    >
      <select
        className="form-control"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      >
        <option value="">Select User</option>
        {users.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </CommonModel>
  );
};

export default AssignTree;
