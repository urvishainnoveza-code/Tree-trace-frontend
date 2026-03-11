import React, { useEffect, useState } from "react";
import Mappicker from "../../components/common-components/Mappicker";
import axiosInstance from "../../utils/axiosInstance";
import "../User/dashboard.css";

function AdminDashboard() {
  const [treeData, setTreeData] = useState([]);
  const [error, setError] = useState("");
  const [totalTrees, setTotalTrees] = useState(0);
  const [plantedTrees, setPlantedTrees] = useState(0);

  useEffect(() => {
    async function fetchPlantations() {
      try {
        const res = await axiosInstance.get("/plantation");
        const plantations = res.data?.Plantation || [];
        // Calculate planted trees (sum of plantedCount)
        const planted = plantations.reduce(
          (sum, p) => sum + (p.plantedCount || 0),
          0,
        );
        setPlantedTrees(planted);
        // Calculate total trees (unique assignment counts)
        const uniqueAssignments = {};
        plantations.forEach((p) => {
          if (p.assign && p.assign._id && !uniqueAssignments[p.assign._id]) {
            uniqueAssignments[p.assign._id] = p.assign.count || 0;
          }
        });
        const total = Object.values(uniqueAssignments).reduce(
          (sum, count) => sum + count,
          0,
        );
        setTotalTrees(total);
        const mapped = plantations
          .filter(
            (p) =>
              p.location &&
              Array.isArray(p.location.coordinates) &&
              p.location.coordinates.length === 2,
          )
          .map((p) => ({
            lat: p.location.coordinates[1],
            lng: p.location.coordinates[0],
            count: p.plantedCount,
            location: p.address || p.assign?.area?.name || "Unknown",
            popup: `ID: ${p._id}<br/>Date: ${new Date(p.plantationDate).toLocaleString()}<br/>Count: ${p.plantedCount}`,
          }));
        setTreeData(mapped);
      } catch (err) {
        setError("Failed to fetch plantation data");
      }
    }
    fetchPlantations();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-6 col-12 mb-2">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="card-title fw-bold">Total Trees</div>
              <div className="display-6 text-primary">{totalTrees}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-12 mb-2">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="card-title fw-bold">Planted Trees</div>
              <div className="display-6 text-success">{plantedTrees}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}
      <Mappicker treeData={treeData} />
    </div>
  );
}
export default AdminDashboard;
