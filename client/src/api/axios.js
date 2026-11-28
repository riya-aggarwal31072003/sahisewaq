import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Send the login token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sq_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A readable message for any failed request
export const getErrorMessage = (err) =>
  err.response?.data?.message ||
  (err.request ? "Cannot reach the server. Is it running?" : err.message);

export default api;