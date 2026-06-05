import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Injecter le token JWT automatiquement sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("madabus_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("madabus_token");
      window.location.href = "/connexion";
    }
    return Promise.reject(error);
  }
);

export default api;