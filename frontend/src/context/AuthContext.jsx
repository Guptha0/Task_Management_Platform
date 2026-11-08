import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, subscribeToConnectionState, checkBackendHealth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    checkBackendHealth();
    const unsubscribe = subscribeToConnectionState((connected) => {
      setIsBackendConnected(connected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      const storedUser = localStorage.getItem('taskflow_user');

      if (storedToken) {
        try {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          const res = await authAPI.getMe(storedToken);
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('taskflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[Auth] Token validation fallback:', err.message);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed.');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData, token);
      const updatedUser = res?.data || res?.user;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
      }
      return { success: true, user: updatedUser };
    } catch (err) {
      // Local fallback
      const updated = { ...user, ...profileData };
      setUser(updated);
      localStorage.setItem('taskflow_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  };

  const loginAsDemo = async () => {
    return await login('demo@taskflow.com', 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  const refreshConnection = async () => {
    return await checkBackendHealth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        setError,
        isBackendConnected,
        login,
        register,
        updateProfile,
        logout,
        loginAsDemo,
        refreshConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
