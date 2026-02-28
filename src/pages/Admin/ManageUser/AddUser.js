import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CommonModalForm from "../../../components/common-components/CommonModalForm";

const AddUser = ({ show, onClose, isAdmin = false, onSuccess }) => {
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

  const handleChange = (updatedValues) => {
    setValues((prev) => {
      const next = { ...updatedValues };

      if (next.country !== prev.country) {
        fetchStates(next.country);
        next.state = "";
        next.city = "";
        next.area = "";
        setStates([]);
        setCities([]);
        setAreas([]);
      }

      if (next.state !== prev.state) {
        fetchCities(next.state);
        next.city = "";
        next.area = "";
        setCities([]);
        setAreas([]);
      }

      if (next.city !== prev.city) {
        fetchAreas(next.city);
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

      // Validate required fields
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
        onSuccess && onSuccess();
        onClose && onClose();
      }
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to create user");
      console.error("Add User error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Basic Information",
      fields: [
        { label: "First Name", name: "firstName", required: true },
        { label: "Last Name", name: "lastName", required: true },
        { label: "Email", name: "email", type: "email", required: true },
        { label: "Phone No", name: "phoneNo" },
        { label: "Date of Birth", name: "birthDate", type: "date" },
        {
          label: "Gender",
          name: "gender",
          type: "select",
          options: [
            { label: "Select Gender", value: "" },
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
      ],
    },
    {
      title: "Address Details",
      fields: [
        { label: "House No", name: "houseNo" },
        { label: "Society Name", name: "societyName" },
        { label: "Landmark", name: "landmark" },
        {
          label: "Country",
          name: "country",
          type: "select",
          options: [
            { label: "Select Country", value: "" },
            ...countries.map((c) => ({
              label: c.name,
              value: c._id,
            })),
          ],
        },
        {
          label: "State",
          name: "state",
          type: "select",
          options: [
            { label: "Select State", value: "" },
            ...states.map((s) => ({
              label: s.name,
              value: s._id,
            })),
          ],
          disabled: !values.country,
        },
        {
          label: "City",
          name: "city",
          type: "select",
          options: [
            { label: "Select City", value: "" },
            ...cities.map((c) => ({
              label: c.name,
              value: c._id,
            })),
          ],
          disabled: !values.state,
        },
        {
          label: "Area",
          name: "area",
          type: "select",
          options: [
            { label: "Select Area", value: "" },
            ...areas.map((a) => ({
              label: a.name,
              value: a._id,
            })),
          ],
          disabled: !values.city,
          required: true,
        },
      ],
    },
  ];

  return (
    <CommonModalForm
      visible={show}
      title="Add New User"
      sections={sections}
      values={values}
      onChange={handleChange}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel="Create User"
      loading={loading}
      error={error}
    />
  );
};

export default AddUser;
