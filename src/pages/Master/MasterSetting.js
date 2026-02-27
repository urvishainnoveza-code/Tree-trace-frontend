import React from "react";
import CommonCard from "../../components/common-components/CommonCard";
import { useNavigate } from "react-router-dom";

const MasterSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Master Settings</h2>
      <div className="flex flex-wrap gap-4">
        <CommonCard title="Country" onClick={() => navigate("/countries")} />
        <CommonCard
          title="State"
          onClick={() => navigate("/states")}
        />
        <CommonCard
          title="City"
          onClick={() =>navigate("/cities")}
        />
         <CommonCard
          title="Area"
          onClick={() =>navigate("/areas")}
        />
        <CommonCard
          title="Treename"
          onClick={() =>navigate("/treename")}
        />
      </div>
    </div>
  );
};

export default MasterSettings;
