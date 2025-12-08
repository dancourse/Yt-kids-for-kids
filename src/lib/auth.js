// Authentication utilities for the frontend

const TOKEN_KEY = 'kiddotube_token';
const PROFILE_KEY = 'kiddotube_profile';

export const auth = {
  // Save authentication token
  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get current token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token (logout)
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },

  // Save current profile
  saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  // Get current profile
  getProfile() {
    const profile = localStorage.getItem(PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get auth headers for API requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
