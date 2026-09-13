import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: "http://localhost:4000/api/v1",
  baseURL: "https://researchlink-w4k2.onrender.com/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
