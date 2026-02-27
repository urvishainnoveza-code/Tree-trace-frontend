import React, { useState } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddArea = ({ show, onClose, onSaved, countries, states, cities }) => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    areaname: "",
  });

  const [errors, setErrors] = useState({});

  const filteredStates = states.filter(
    (s) => String(s.country?._id || s.country) === String(formData.country)
  );

  const filteredCities = cities.filter(
    (c) => String(c.state?._id || c.state) === String(formData.state)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") setFormData({ country: value, state: "", city: "", areaname: "" });
    else if (name === "state") setFormData({ ...formData, state: value, city: "" });
    else setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let temp = {};
    if (!formData.country) temp.country = "Country is required";
    if (!formData.state) temp.state = "State is required";
    if (!formData.city) temp.city = "City is required";
    if (!formData.areaname) temp.areaname = "Area name is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/areas", {
        areaname: formData.areaname,
        city: formData.city,
      });

      const selectedCountry = countries.find((c) => c._id === formData.country);
      const selectedState = states.find((s) => s._id === formData.state);
      const selectedCity = cities.find((c) => c._id === formData.city);

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
        statename: selectedState?.statename || "",
        cityname: selectedCity?.cityname || "",
      });

      setFormData({ country: "", state: "", city: "", areaname: "" });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add area");
    }
  };

  const fields = [
    {
      label: "Country",
      name: "country",
      type: "select",
      options: countries.map((c) => ({ value: c._id, label: c.countryname })),
    },
    {
      label: "State",
      name: "state",
      type: "select",
      options: filteredStates.map((s) => ({ value: s._id, label: s.statename })),
    },
    {
      label: "City",
      name: "city",
      type: "select",
      options: filteredCities.map((c) => ({ value: c._id, label: c.cityname })),
    },
    { label: "Area Name", name: "areaname", type: "text" },
  ];

  return (
    <CommonModel show={show} title="Add Area" onClose={onClose} onSave={handleSubmit}>
      <CommonForm fields={fields} formData={formData} onChange={handleChange} errors={errors} />
    </CommonModel>
  );
};

export default AddArea;





/*import React, { useState } from "react";
import axios from "axios";
import CommonForm from "../../../components/common-components/CommonForm";
import CommonModel from "../../../components/common-components/CommonModel";

const AddArea = ({ show, onClose, onSaved, countries, states, cities }) => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    areaname: "",
  });

  const [errors, setErrors] = useState({});

  const countryOptions = countries.map((c) => ({ value: c._id, label: c.countryname }));
  const stateOptions = states
    .filter((s) => s.country === formData.country || s.country?._id === formData.country)
    .map((s) => ({ value: s._id, label: s.statename }));
  const cityOptions = cities
    .filter((c) => c.state === formData.state || c.state?._id === formData.state)
    .map((c) => ({ value: c._id, label: c.cityname }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") setFormData({ country: value, state: "", city: "", areaname: "" });
    else if (name === "state") setFormData({ ...formData, state: value, city: "" });
    else setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let temp = {};
    if (!formData.country) temp.country = "Country is required";
    if (!formData.state) temp.state = "State is required";
    if (!formData.city) temp.city = "City is required";
    if (!formData.areaname) temp.areaname = "Area name is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/areas", formData);

      const selectedCountry = countries.find((c) => c._id === formData.country);
      const selectedState = states.find((s) => s._id === formData.state);
      const selectedCity = cities.find((c) => c._id === formData.city);

      onSaved({
        ...res.data.data,
        countryname: selectedCountry?.countryname || "",
        statename: selectedState?.statename || "",
        cityname: selectedCity?.cityname || "",
      });

      setFormData({ country: "", state: "", city: "", areaname: "" });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add area");
    }
  };

  const fields = [
    { label: "Country", name: "country", type: "select", options: countryOptions },
    { label: "State", name: "state", type: "select", options: stateOptions },
    { label: "City", name: "city", type: "select", options: cityOptions },
    { label: "Area Name", name: "areaname" },
  ];

  return (
    <CommonModel show={show} title="Add Area" onClose={onClose} onSave={handleSubmit}>
      <CommonForm fields={fields} formData={formData} onChange={handleChange} errors={errors} />
    </CommonModel>
  );
};

export default AddArea;*/

