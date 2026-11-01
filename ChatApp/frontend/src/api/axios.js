import axios from "axios";

export const STORAGE_KEY = "userInfo";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.token) config.headers.Authorization = `Bearer ${stored.token}`;
  } catch {
    // corrupted storage: send the request without a token
  }
  return config;
});

// An expired or revoked token anywhere in the app signs the user out
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isCredentialCall = url.startsWith("/auth/login") || url.startsWith("/auth/register");

    if (error.response?.status === 401 && !isCredentialCall) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return "Cannot reach the server. Check your connection.";
  return fallback;
};

export default API;
