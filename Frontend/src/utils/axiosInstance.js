import axios from "axios";

// Reads token from localStorage on every request automatically
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("naarisa-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires, redirect to auth
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (
      status === 401 &&
      (
        message === "Invalid token" ||
        message === "Not authorized"
      )
    ) {
      localStorage.removeItem("naarisa-token");
      localStorage.removeItem("naarisa-user");

      window.location.href =
        "/auth?redirect=" +
        encodeURIComponent(window.location.pathname);
    }

    return Promise.reject(err);
  }
);

export default api;