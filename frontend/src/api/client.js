import axios from "axios";

import { auth } from "../firebase.js";

/** Same-origin `/api` on Vercel when unset; local dev uses full URL in .env */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
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

export async function searchProfiles(filters) {
  const response = await api.get("/api/users/search", { params: filters });
  return response.data;
}

export async function sendMatchRequest(toUid, message) {
  const response = await api.post("/api/match-requests", { toUid, message });
  return response.data;
}

export async function fetchMatchRequests() {
  const response = await api.get("/api/match-requests");
  return response.data;
}

export async function respondToMatchRequest(requestId, status) {
  const response = await api.patch(`/api/match-requests/${requestId}`, { status });
  return response.data;
}

export async function submitVerificationQuestion(requestId, question) {
  const response = await api.post(`/api/match-requests/${requestId}/question`, { question });
  return response.data;
}

export async function submitVerificationAnswer(requestId, answer) {
  const response = await api.post(`/api/match-requests/${requestId}/answer`, { answer });
  return response.data;
}

export async function confirmVerification(requestId) {
  const response = await api.post(`/api/match-requests/${requestId}/confirm`);
  return response.data;
}

export async function fetchChats() {
  const response = await api.get("/api/chats");
  return response.data;
}

export async function fetchChatMessages(matchRequestId) {
  const response = await api.get(`/api/chats/${matchRequestId}/messages`);
  return response.data;
}

export async function sendChatMessage(matchRequestId, text) {
  const response = await api.post(`/api/chats/${matchRequestId}/messages`, { text });
  return response.data;
}

export async function leaveChat(matchRequestId) {
  const response = await api.post(`/api/chats/${matchRequestId}/leave`);
  return response.data;
}

export async function blockAccount(matchRequestId) {
  const response = await api.post(`/api/chats/${matchRequestId}/block`);
  return response.data;
}

export async function deleteAccountAndData() {
  const response = await api.delete("/api/account");
  return response.data;
}

export default api;
