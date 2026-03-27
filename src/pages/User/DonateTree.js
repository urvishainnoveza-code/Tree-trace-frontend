import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toastSuccess, toastError } from "../../utils/alertHelper";
import { useNavigate } from "react-router-dom";
import CommonForm from "../../components/common-components/CommonForm";

export default function DonateTree() {
  const [form, setForm] = useState({
    quantity: 1,
    amount: "",
    treename: "",
  });
  const [loading, setLoading] = useState(false);
  const [treenames, setTreenames] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch master data
    axiosInstance
      .get("/treename", { params: { page: 1, limit: 100 } })
      .then((res) => {
        setTreenames(res.data.data || res.data.Data || []);
      });
  }, []);

  const handleChange = (e) => {
    // For CommonForm compatibility (event or direct value)
    if (e && e.target) {
      setForm({ ...form, [e.target.name]: e.target.value });
    } else if (e && e.name) {
      setForm({ ...form, [e.name]: e.value });
    }
  };

  const validate = () => {
    const err = {};
    if (!form.treename) err.treename = "Tree name is required.";
    if (!form.quantity || form.quantity < 1)
      err.quantity = "Quantity must be at least 1.";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setLoading(true);
    // Remove empty fields for backend cleanliness
    const payload = { ...form };
    ["treename"].forEach((f) => {
      if (!payload[f]) delete payload[f];
    });
    axiosInstance
      .post("/donations", payload)
      .then(() => {
        toastSuccess("Donation successful!");
        navigate("/donor-dashboard");
      })
      .catch(() => toastError("Error donating"))
      .finally(() => setLoading(false));
  };

  // CommonForm fields config
  const fields = [
    {
      name: "treename",
      label: "Tree Name",
      type: "select",
      required: true,
      options: treenames.map((t) => ({ value: t._id, label: t.name })),
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      min: 1,
      required: true,
    },
    {
      name: "amount",
      label: "Amount (optional)",
      type: "number",
      min: 0,
      required: false,
    },
  ];

  return (
    <div className="container">
      <h2>Donate</h2>
      <form onSubmit={handleSubmit}>
        <CommonForm
          fields={fields}
          formData={form}
          onChange={handleChange}
          errors={errors}
          disabled={loading}
        />
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? "Donating..." : "Donate"}
          </button>
          <button
            type="button"
            className="auth-btn-link"
            onClick={() => navigate("/donor-dashboard")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
