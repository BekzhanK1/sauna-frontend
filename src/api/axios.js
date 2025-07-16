import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // your backend URL
});

// Add access token to every request automatically
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(
            "http://localhost:8000/api/users/token/refresh/",
            { refresh }
          );
          localStorage.setItem("access", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          // Optionally redirect to login page
        }
      }
    }
    return Promise.reject(error);
  }
);

export const unauthenticatedApi = axios.create({
  baseURL: "http://localhost:8000", // your backend URL
});

export default api;
