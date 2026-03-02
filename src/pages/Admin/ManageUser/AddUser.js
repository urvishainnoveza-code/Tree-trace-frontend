import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddUser = ({ show, onClose, isAdmin = false, onSuccess, onSaved }) => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    birthDate: "",
    gender: "",
    houseNo: "",
    societyName: "",
    landmark: "",
    country: "",
    state: "",
    city: "",
    area: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      fetchCountries();
    }
  }, [show]);

  const fetchCountries = async () => {
    try {
      const res = await axiosInstance.get("/countries");
      setCountries(res.data.data || []);
    } catch (err) {
      console.error("Country fetch error", err);
    }
  };

  const fetchStates = async (countryId) => {
    if (!countryId) return;
    try {
      const res = await axiosInstance.get(`/states/country/${countryId}`);
      setStates(res.data.data || []);
    } catch (err) {
      console.error("State fetch error", err);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) return;
    try {
      const res = await axiosInstance.get(`/cities/state/${stateId}`);
      setCities(res.data.data || []);
    } catch (err) {
      console.error("City fetch error", err);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!cityId) return;
    try {
      const res = await axiosInstance.get(`/areas/city/${cityId}`);
      setAreas(res.data.data || []);
    } catch (err) {
      console.error("Area fetch error", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setValues((prev) => {
      const next = { ...prev, [name]: value };

      if (next.country !== prev.country) {
        if (next.country) fetchStates(next.country);
        next.state = "";
        next.city = "";
        next.area = "";
        setStates([]);
        setCities([]);
        setAreas([]);
      }

      if (next.state !== prev.state) {
        if (next.state) fetchCities(next.state);
        next.city = "";
        next.area = "";
        setCities([]);
        setAreas([]);
      }

      if (next.city !== prev.city) {
        if (next.city) fetchAreas(next.city);
        next.area = "";
        setAreas([]);
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (
        !values.firstName ||
        !values.lastName ||
        !values.email ||
        !values.area
      ) {
        setError("Required fields: First Name, Last Name, Email, Area");
        setLoading(false);
        return;
      }

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNo: values.phoneNo,
        birthDate: values.birthDate,
        gender: values.gender,
        houseNo: values.houseNo,
        societyName: values.societyName,
        landmark: values.landmark,
        area: values.area,
        userType: "user",
      };

      const res = await axiosInstance.post("/users", payload);

      if (res.data.Status === 1) {
        alert("User created successfully!");
        // Reset form
        setValues({
          firstName: "",
          lastName: "",
          email: "",
          phoneNo: "",
          birthDate: "",
          gender: "",
          houseNo: "",
          societyName: "",
          landmark: "",
          country: "",
          state: "",
          city: "",
          area: "",
        });
        if (onSuccess) onSuccess();
        if (onSaved) onSaved();
        onClose && onClose();
      }
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to create user");
      console.error("Add User error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "First Name",
      name: "firstName",
      required: true,
      colClass: "col-md-6",
    },
    {
      label: "Last Name",
      name: "lastName",
      required: true,
      colClass: "col-md-6",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: true,
      colClass: "col-md-6",
    },
    { label: "Phone No", name: "phoneNo", colClass: "col-md-6" },
    {
      label: "Date of Birth",
      name: "birthDate",
      type: "date",
      colClass: "col-md-6",
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      colClass: "col-md-6",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
    },
    { label: "House No", name: "houseNo", colClass: "col-md-6" },
    { label: "Society Name", name: "societyName", colClass: "col-md-6" },
    { label: "Landmark", name: "landmark", colClass: "col-md-6" },
    {
      label: "Country",
      name: "country",
      type: "select",
      colClass: "col-md-6",
      options: countries.map((c) => ({
        label: c.name,
        value: c._id,
      })),
    },
    {
      label: "State",
      name: "state",
      type: "select",
      colClass: "col-md-6",
      options: states.map((s) => ({
        label: s.name,
        value: s._id,
      })),
      disabled: !values.country,
    },
    {
      label: "City",
      name: "city",
      type: "select",
      colClass: "col-md-6",
      options: cities.map((c) => ({
        label: c.name,
        value: c._id,
      })),
      disabled: !values.state,
    },
    {
      label: "Area",
      name: "area",
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: areas.map((a) => ({
        label: a.name,
        value: a._id,
      })),
      disabled: !values.city,
    },
  ];

  return (
    <CommonModel
      show={show}
      title="Add New User"
      onClose={onClose}
      buttons={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
          disabled: loading,
        },
        {
          label: loading ? "Creating..." : "Create User",
          onClick: handleSubmit,
          variant: "primary",
          disabled: loading,
        },
      ]}
    >
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <CommonForm fields={fields} formData={values} onChange={handleChange} />
    </CommonModel>
  );
};

export default AddUser;
