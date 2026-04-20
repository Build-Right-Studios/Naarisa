import axios from "axios";
import { BASE } from "../Constants/apiroutes.js";

const api = axios.create({
  baseURL: BASE.ROUTE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
