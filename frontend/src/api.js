import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  console.log("API request:", config.method?.toUpperCase(), config.url, "token:", token);

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("API response:", response.status, response.config?.url, response.data);
    return response;
  },
  (error) => {
    console.error(
      "API response error:",
      error.response?.status,
      error.response?.config?.url,
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.log("Invalid or expired token detected. Clearing auth and redirecting to login.");
      localStorage.clear();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;