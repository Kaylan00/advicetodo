import { request } from "./client";

export const auth = {
  login: (email, password) =>
    request("/auth/login/", { method: "POST", body: { email, password }, auth: false }),
  register: (payload) =>
    request("/auth/register/", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me/"),
};

export const tasks = {
  list: (params) => request("/tasks/", { params }),
  create: (payload) => request("/tasks/", { method: "POST", body: payload }),
  update: (id, payload) => request(`/tasks/${id}/`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/tasks/${id}/`, { method: "DELETE" }),
  toggle: (id) => request(`/tasks/${id}/toggle/`, { method: "POST" }),
  share: (id, payload) => request(`/tasks/${id}/shares/`, { method: "POST", body: payload }),
  revokeShare: (id, userId) => request(`/tasks/${id}/shares/${userId}/`, { method: "DELETE" }),
};

export const holidays = {
  list: (year) => request("/holidays/", { params: { year } }),
};

export const categories = {
  list: () => request("/categories/", { params: { page_size: 100 } }),
  create: (payload) => request("/categories/", { method: "POST", body: payload }),
  remove: (id) => request(`/categories/${id}/`, { method: "DELETE" }),
};
