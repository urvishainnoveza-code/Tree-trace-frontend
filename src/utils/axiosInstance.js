import axios from "axios";
import { getToken, logout } from "./auth";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API || "http://localhost:5000/api",
});

// Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, logout user
    if (error.response?.status === 401) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
