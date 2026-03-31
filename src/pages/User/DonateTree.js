import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toastSuccess, toastError } from "../../utils/alertHelper";
import { useNavigate } from "react-router-dom";
import CommonModalForm from "../../components/common-components/CommonModalForm";
import "../../components/common-components/common.css"

export default function DonateTree() {
  // Prices must match backend
  const CAGE_PRICE = 100;
  const NO_CAGE_PRICE = 50;

  const [form, setForm] = useState({
    quantity: "",
    amount: "",
    cage: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  // Helper to get price per tree
  const getPricePerTree = (cage) => (cage ? CAGE_PRICE : NO_CAGE_PRICE);

  // For CommonModalForm: receives updated form object
  const handleChange = (updatedForm) => {
    // Auto-calculate logic for amount/quantity/cage
    let newForm = { ...updatedForm };
    const pricePerTree = getPricePerTree(newForm.cage);
    // If quantity changed, recalc amount
    if (
      (form.quantity !== newForm.quantity && newForm.quantity !== "") ||
      (form.cage !== newForm.cage && newForm.quantity)
    ) {
      if (newForm.quantity && Number(newForm.quantity) > 0) {
        newForm.amount = Number(newForm.quantity) * pricePerTree;
      } else {
        newForm.amount = "";
      }
    }
    // If amount changed, recalc quantity
    if (
      (form.amount !== newForm.amount && newForm.amount !== "") ||
      (form.cage !== newForm.cage && newForm.amount)
    ) {
      if (newForm.amount && Number(newForm.amount) > 0) {
        newForm.quantity =
          Math.floor(Number(newForm.amount) / pricePerTree) || "";
      } else {
        newForm.quantity = "";
      }
    }
    setForm(newForm);
  };

  const validate = () => {
      const err = {};
    const pricePerTree = getPricePerTree(form.cage);
    const quantity = Number(form.quantity);
    const amount = Number(form.amount);
   
    if ((!amount || amount < 1) && (!quantity || quantity < 1)) {
      err.amount = "Please provide either amount or quantity.";
      err.quantity = "Please provide either amount or quantity.";
    }
    if (quantity && (!amount || amount < 1)) {
      if (quantity < 1) err.quantity = "Quantity must be at least 1.";
    }
    if (amount && (!quantity || quantity < 1)) {
      if (amount < pricePerTree)
        err.amount = `Amount is too low for at least 1 tree (min: ${pricePerTree})`;
    }
    if (amount && quantity) {
      if (amount !== quantity * pricePerTree) {
        err.amount = `Amount and quantity do not match the selected price per tree (${pricePerTree})`;
        err.quantity = `Amount and quantity do not match the selected price per tree (${pricePerTree})`;
      }
    }
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setLoading(true);
    // Only send amount, quantity, cage
    const payload = {
      amount: Number(form.amount),
      quantity: Number(form.quantity),
      cage: !!form.cage,
    };
    axiosInstance
      .post("/donations", payload)
      .then(() => {
        toastSuccess("Donation successful!");
        setShowModal(false);
        navigate("/donor-dashboard");
      })
      .catch(() => toastError("Error donating"))
      .finally(() => setLoading(false));
  };

  // CommonModalForm fields config
  const fields = [
    {
      name: "cage",
      label: "Cage",
      type: "checkbox",
      required: false,
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      min: 1,
      required: false,
      helperText: `Auto-calculated if you enter amount. Price per tree: ${getPricePerTree(form.cage)}`,
      placeholder: "Enter number of trees",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      min: 0,
      required: false,
      helperText: `Auto-calculated if you enter quantity. Price per tree: ${getPricePerTree(form.cage)}`,
      placeholder: "Enter total amount",
    },
  ];

  return (
    <CommonModalForm
      visible={showModal}
      title="Donate Tree"
      fields={fields}
      values={form}
      onChange={handleChange}
      onCancel={() => {
        setShowModal(false);
        navigate("/donor-dashboard");
      }}
      onSubmit={handleSubmit}
      errors={errors}
      submitLabel={loading ? "Donating..." : "Donate"}
      cancelLabel="Cancel"
      disabled={loading}
    />
  );
}
