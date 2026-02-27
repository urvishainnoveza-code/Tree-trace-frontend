  import React from "react";
  import { Navigate } from "react-router-dom";
  import { getAuth } from "./utils/auth";

  const ProtectedRoute = ({ children, allowedRole }) => {
    const { token, userType } = getAuth();

    if (!token) return <Navigate to="/" />;

    if (allowedRole && userType !== allowedRole) {
      return <Navigate to="/" />;
    }

    return children;
  };

  export default ProtectedRoute;
