import api from './api';
import { jwtDecode } from 'jwt-decode';

// User API service
export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Verify 2FA for login
  verify2FALogin: async (email, password, token) => {
    const response = await api.post('/users/login', { email, password, token });
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
  },
  
  // Get user profile
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  // Update user profile
  updateUserProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  // Setup 2FA
  setup2FA: async () => {
    const response = await api.get('/users/2fa/setup');
    return response.data;
  },
  
  // Verify and enable 2FA
  verify2FA: async (token) => {
    const response = await api.post('/users/2fa/verify', { token });
    return response.data;
  },
  
  // Disable 2FA
  disable2FA: async (password) => {
    const response = await api.delete('/users/2fa', { data: { password } });
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        // Token expired
        authService.logout();
        return false;
      }
      return true;
    } catch (error) {
      // Invalid token
      authService.logout();
      return false;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;