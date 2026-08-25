// FUN/frontend/src/services/api.js
const BASE_URL = "/api/data";

const apiCall = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return await response.json();
};

// Authentication
export const register = async (username, email, password) => {
  return apiCall("/register", "POST", { username, email, password });
};

export const login = async (email, password) => {
  return apiCall("/login", "POST", { email, password });
};

// Categories
export const getCategories = async () => {
  return apiCall("/categories", "GET");
};

export const createCategory = async (name) => {
  return apiCall("/categories", "POST", {name });
};

export const deleteCategory = async (categoryID) => {
  return apiCall(`/categories/${categoryID}`, "DELETE");
};

// Notes
export const getNotes = async () => {
  return apiCall("/notes", "GET");
};

export const createNote = async (categoryID, title, content, color) => {
  return apiCall("/notes", "POST", { categoryID, title, content, color });
};

export const updateNote = async (
  noteID,
  title,
  content,
  color,
  categoryID,
  is_pinned,
) => {
  return apiCall(`/notes/${noteID}`, "PUT", {
    title,
    content,
    color,
    categoryID,
    is_pinned,
  });
};

export const deleteNote = async (noteID) => {
  return apiCall(`/notes/${noteID}`, "DELETE");
};

// Tags
export const createTag = async (name) => {
  return apiCall("/tags", "POST", { name });
};

export const linkTagToNote = async (noteID, tagID) => {
  return apiCall("/notes/tag", "POST", { noteID, tagID });
};

export const getNoteTags = async (noteID) => {
  return apiCall(`/notes/${noteID}/tags`, "GET");
};

export const clearNoteTags = async (noteID) => {
  return apiCall(`/notes/${noteID}/tags`, "DELETE");
};

// Settings
export const getSettings = async () => {
  return apiCall("/settings", "GET");
};

export const updateSettings = async (theme, default_color, ai_enabled) => {
  return apiCall("/settings", "PUT", { theme, default_color, ai_enabled });
};

// AI
export const transformNote = async (content, tone) => {
  return apiCall("/ai/transform", "POST", { content, tone });
};
