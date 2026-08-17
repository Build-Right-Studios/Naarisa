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
    const requestUrl = err.config?.url || "";

    // Don't treat login/signup failures as "session expired"
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      console.log("Session invalidated:", message); // keep temporarily to see real messages

      localStorage.removeItem("naarisa-token");
      localStorage.removeItem("naarisa-user");

      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href =
          "/auth?redirect=" + encodeURIComponent(window.location.pathname);
      }
    }

    return Promise.reject(err);
  }
);

export default api;