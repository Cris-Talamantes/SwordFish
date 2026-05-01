import axios from "axios";

import { auth } from "../firebase.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function fetchSession() {
  const response = await api.get("/api/auth/session");
  return response.data;
}

export default api;
