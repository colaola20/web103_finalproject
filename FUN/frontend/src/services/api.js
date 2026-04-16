const BASE_URL = "http://localhost:3000";

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Authentication Endpoints
export const register = async (username, email, password) => {
  return apiCall('/register', 'POST', { username, email, password });
};

export const login = async (email, password) => {
  return apiCall('/login', 'POST', { email, password });
};

// Categories Endpoints
export const getCategories = async (userID) => {
  return apiCall(`/categories/${userID}`, 'GET');
};

export const createCategory = async (userID, name) => {
  return apiCall('/categories', 'POST', { userID, name });
};

export const deleteCategory = async (categoryID, userID) => {
  return apiCall(`/categories/${categoryID}`, 'DELETE', { userID });
};

// Notes Endpoints
export const getNotes = async (userID) => {
  return apiCall(`/notes/${userID}`, 'GET');
};

export const createNote = async (userID, categoryID, title, content, color) => {
  return apiCall('/notes', 'POST', { userID, categoryID, title, content, color });
};

export const updateNote = async (noteID, userID, title, content, color, categoryID, is_pinned) => {
  return apiCall(`/notes/${noteID}`, 'PUT', { userID, title, content, color, categoryID, is_pinned });
};

export const deleteNote = async (noteID, userID) => {
  return apiCall(`/notes/${noteID}`, 'DELETE', { userID });
};

// Tags Endpoints
export const createTag = async (userID, name) => {
  return apiCall('/tags', 'POST', { userID, name });
};

export const linkTagToNote = async (noteID, tagID) => {
  return apiCall('/notes/tag', 'POST', { noteID, tagID });
};

// Settings Endpoints
export const getSettings = async (userID) => {
  return apiCall(`/settings/${userID}`, 'GET');
};

export const updateSettings = async (userID, theme, default_color, ai_enabled) => {
  return apiCall(`/settings/${userID}`, 'PUT', { theme, default_color, ai_enabled });
};

// Test endpoint
export const helloWord = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hello`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API Request Failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching hello word:", error);
    throw error;
  }
};


