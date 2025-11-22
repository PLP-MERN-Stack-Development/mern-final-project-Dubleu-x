import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user'); // Check for stored user data
      
      console.log('Auth Init - Token:', storedToken);
      console.log('Auth Init - User:', storedUser);

      if (storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        
        // Try to get user from localStorage first, then fetch from API
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setLoading(false);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            await fetchUser();
          }
        } else {
          await fetchUser();
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user from API...');
      const response = await api.get('/api/auth/me');
      console.log('User API response:', response.data);
      
      if (response.data.user) {
        setUser(response.data.user);
        // Also store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.warn('No user data in response');
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // If /api/auth/me fails, try to get user data from token or use fallback
      attemptTokenDecode();
    } finally {
      setLoading(false);
    }
  };

  const attemptTokenDecode = () => {
    // Simple JWT decode (without verification) to get user ID
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('Token payload:', payload);
        
        // Create minimal user object from token
        if (payload.userId) {
          const minimalUser = {
            id: payload.userId,
            // Add other fields if available in token
          };
          setUser(minimalUser);
          localStorage.setItem('user', JSON.stringify(minimalUser));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
      }
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      console.log('Login response:', response.data);
      
      // CRITICAL FIX: Store both token AND user data
      localStorage.setItem('token', newToken);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🎯 STARTING REGISTRATION...');
      console.log('📤 Sending data to:', '/api/auth/register');
      console.log('📦 Registration data:', userData);

      const response = await api.post('/api/auth/register', userData);
      
      console.log('✅ REGISTRATION SUCCESS - Full response:', response);
      console.log('✅ Response data:', response.data);
      
      const { token: newToken, user: userDataResponse } = response.data;
      
      console.log('🔐 Token from response:', newToken);
      console.log('👤 User from response:', userDataResponse);
      
      // Save to localStorage
      localStorage.setItem('token', newToken);
      if (userDataResponse) {
        localStorage.setItem('user', JSON.stringify(userDataResponse));
      }
      
      console.log('💾 Token saved to localStorage:', localStorage.getItem('token'));
      console.log('💾 User saved to localStorage:', localStorage.getItem('user'));
      
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userDataResponse);
      
      return { success: true };
    } catch (error) {
      console.error('❌ REGISTRATION FAILED:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // FIX: Remove user data too
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Also update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};