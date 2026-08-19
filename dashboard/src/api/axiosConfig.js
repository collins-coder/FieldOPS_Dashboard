// src/api/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // use localhost consistently
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= INTERCEPTOR =================
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

// ================= RESPONSE INTERCEPTOR (OPTIONAL BUT IMPORTANT) =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// Many Express/Flask APIs wrap list responses like
// { success: true, data: [...] } or { results: [...] } instead of
// returning a bare array. If a page reads `res.data` and gets an object
// instead of an array, `.length`/`.map()` on it either crashes or silently
// shows nothing — which looks exactly like "the dashboard can't read data
// that's in the database" even though the request actually succeeded.
// Use this instead of `res.data || []` wherever a list is expected.
export function unwrapList(resData) {
  if (Array.isArray(resData)) return resData;
  if (!resData || typeof resData !== "object") return [];
  for (const key of ["data", "results", "records", "items", "customers", "orders", "invoices", "payments", "deliveries"]) {
    if (Array.isArray(resData[key])) return resData[key];
  }
  return [];
}

export default api;