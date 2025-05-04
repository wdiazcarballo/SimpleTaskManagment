import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext();

// Auth context provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      if (authService.isAuthenticated()) {
        setUser(authService.getCurrentUser());
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      // If 2FA is required, don't set user yet
      if (!data.requireTwoFactor) {
        setUser(data);
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // Verify 2FA for login
  const verify2FALogin = async (email, password, token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.verify2FALogin(email, password, token);
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || '2FA verification failed');
      setLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Setup 2FA
  const setup2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.setup2FA();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || '2FA setup failed');
      setLoading(false);
      throw err;
    }
  };

  // Verify and enable 2FA
  const verify2FA = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.verify2FA(token);
      
      // Update user with 2FA enabled
      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || '2FA verification failed');
      setLoading(false);
      throw err;
    }
  };

  // Disable 2FA
  const disable2FA = async (password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.disable2FA(password);
      
      // Update user with 2FA disabled
      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
      setLoading(false);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.updateUserProfile(userData);
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        verify2FALogin,
        logout,
        setup2FA,
        verify2FA,
        disable2FA,
        updateProfile,
        isAuthenticated: authService.isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;