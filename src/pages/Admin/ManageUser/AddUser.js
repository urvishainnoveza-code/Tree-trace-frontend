import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonModalForm from "../../../components/common-components/CommonModalForm";

const AddUser = ({ show, onClose, isAdmin = false }) => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    dob: "",
    gender: "",
    address: {
      houseNo: "",
      societyName: "",
      landmark: "",
      country: "",
      state: "",
      city: "",
      area: "",
    },
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/countries");
      setCountries(res.data.data || []);
    } catch (err) {
      console.error("Country fetch error", err);
    }
  };

  const fetchStates = async (countryId) => {
    if (!countryId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/states/country/${countryId}`,
      );
      setStates(res.data.data || []);
    } catch (err) {
      console.error("State fetch error", err);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cities/state/${stateId}`,
      );
      setCities(res.data.data || []);
    } catch (err) {
      console.error("City fetch error", err);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!cityId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/areas/city/${cityId}`,
      );
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
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNo: values.phoneNo,
        dob: values.dob,
        gender: values.gender,
        address: {
          houseNo: values.houseNo,
          societyName: values.societyName,
          landmark: values.landmark,
          country: values.country,
          state: values.state,
          city: values.city,
          area: values.area,
        },
      };

      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      let url = "";
      let config = {};

      if (token && userType === "superAdmin") {
        url = "http://localhost:5000/api/auth/admin/create-user";
        config.headers = { Authorization: `Bearer ${token}` };
      } else {
        url = "http://localhost:5000/api/auth/register";
      }

      await axios.post(url, payload, config);

      alert("User registered successfully!");
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to register");
    }
  };

  const sections = [
    {
      title: "Basic Information",
      fields: [
        { label: "First Name", name: "firstName" },
        { label: "Last Name", name: "lastName" },
        { label: "Email", name: "email", type: "email" },
        { label: "Phone No", name: "phoneNo" },
        { label: "Date of Birth", name: "dob", type: "date" },
        {
          label: "Gender",
          name: "gender",
          type: "radio",
          options: [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
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
          options: countries.map((c) => ({
            label: c.countryname,
            value: c._id,
          })),
        },
        {
          label: "State",
          name: "state",
          type: "select",
          options: states.map((s) => ({
            label: s.statename,
            value: s._id,
          })),
        },
        {
          label: "City",
          name: "city",
          type: "select",
          options: cities.map((c) => ({
            label: c.cityname,
            value: c._id,
          })),
        },
        {
          label: "Area",
          name: "area",
          type: "select",
          options: areas.map((a) => ({
            label: a.areaname,
            value: a._id,
          })),
        },
      ],
    },
  ];

  return (
    <CommonModalForm
      visible={show}
      title={isAdmin ? "Add User (Admin)" : "Register User"}
      sections={sections}
      values={values}
      onChange={handleChange}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel={isAdmin ? "Add User" : "Register"}
    />
  );
};

export default AddUser;
