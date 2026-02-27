import React, { useState } from "react";
import axios from "axios";
import AddUser from "../../Admin/ManageUser/AddUser";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", values);
      alert("Registration successful!");
      navigate("/"); // go to login
    } catch {
      alert("Registration failed");
    }
  };

  const handleClose = () => {
    setShow(false);    
    navigate("/");     
  };

  return (
    <AddUser
      show={show}
      onClose={handleClose}
      onSubmit={handleRegister}
    />
  );
};

export default Register;
