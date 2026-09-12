import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: "http://localhost:4000/api/v1",
  baseURL: "https://researchlink-w4k2.onrender.com/api/v1",
  withCredentials: true,
});
