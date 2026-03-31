import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getAuth } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../components/common-components/CommonTable";
import "../../components/common-components/common.css";
export default function DonorIndex() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Move auth and roleName above columns to avoid ReferenceError and ESLint warning
  const auth = getAuth();
  const roleName = auth?.user?.role?.name;

  // Extracted fetchDonations for reuse
  const fetchDonations = async () => {
    const auth = getAuth();
    if (!auth?.user) {
      navigate("/user-dashboard");
      return;
    }
    const roleName = auth.user.role?.name;
    let api = "";
    if (roleName === "superAdmin") {
      api = "/donations/all";
    } else if (roleName === "donor") {
      api = "/donations/my-donations";
    } else {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(api);
      setDonations(res.data.Data || []);
    } catch (error) {
      setError(
        error?.response?.data?.Message ||
          error?.message ||
          "Failed to load donations.",
      );
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, [navigate]);

  // Columns for both roles
  const columns = [
    {
      key: "donor.firstName",
      label: "Donor Name",
      render: (row) => row.donor?.firstName + " " + (row.donor?.lastName || ""),
      hideForDonor: true,
    },
    {
      key: "donor.email",
      label: "Email",
      render: (row) => row.donor?.email || "-",
      hideForDonor: true,
    },
    {
      key: "donor.phoneNo",
      label: "Phone",
      render: (row) => row.donor?.phoneNo || "-",
      hideForDonor: true,
    },
    {
      key: "Qty",
      label: "Qty",
      render: (row) => row.quantity,
    },
    {
      key: "cage",
      label: "Cage",
      render: (row) => (row.cage ? "Yes" : "No"),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => row.amount,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colorMap = {
          pending: "orange",
          assigned: "blue",
          completed: "green",
        };
        return (
          <span
            style={{ color: colorMap[row.status] || "black", fontWeight: 600 }}
          >
            {row.status ? row.status.toUpperCase() : "PENDING"}
          </span>
        );
      },
    },
  ];

  if (roleName === "superAdmin") {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn btn-primary common-index-font14"
            style={{
             
              pointerEvents: row.status === "pending" ? "auto" : "none",
            }}
            onClick={() =>
              row.status === "pending"
                ? navigate(`/manage-plantation/assign?donationId=${row._id}`)
                : undefined
            }
            disabled={row.status !== "pending"}
          >
            <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>Assign</span>
          </button>
        </span>
      ),
    });
  }

  // Hide donor columns for donor user

  const visibleColumns =
    roleName === "donor" ? columns.filter((col) => !col.hideForDonor) : columns;
  return (
    <div
      className="container"
      style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}
    >
      <h4 className="commonindex-24">
        {roleName === "superAdmin" ? "All Donations" : "My Donations"}
      </h4>
      {loading ? (
        <div>Loading donations...</div>
      ) : error ? (
        <div style={{ color: "#b71c1c" }}>{error}</div>
      ) : donations.length === 0 ? (
        <div>No donations found.</div>
      ) : (
        <CommonTable columns={visibleColumns} data={donations} />
      )}
    </div>
  );
}
