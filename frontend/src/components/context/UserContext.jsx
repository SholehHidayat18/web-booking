import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../../constant";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Verify token validity on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        
        if (!token && !adminToken) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${adminToken || token}`
          }
        };

        const response = await axios.get(`${API_URL}/auth/verify`, config);
        
        const userData = {
          ...response.data.user,
          is_admin: response.data.user.is_admin ? 1 : 0
        };

        if (adminToken) {
          localStorage.setItem('adminToken', adminToken);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const login = useCallback(async (userData, isAdmin = false) => {
    try {
      const userToStore = {
        ...userData,
        is_admin: Number(userData.is_admin) || 0
      };

      if (isAdmin) {
        localStorage.setItem('adminToken', userData.token);
      } else {
        sessionStorage.setItem('token', userData.token);
      }

      sessionStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      clearAuth();
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    return new Promise((resolve) => {
      // Clear all auth-related data synchronously
      clearAuth();
      
      // Add slight delay to ensure state is cleared before redirect
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      if (!prev) return null;
      
      const updatedUser = { 
        ...prev, 
        ...newUserData,
        is_admin: Number(newUserData.is_admin ?? prev.is_admin)
      };
      
      try {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating user:", error);
      }
      
      return updatedUser;
    });
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading: loading || !authChecked,
        login, 
        logout, 
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin === 1
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};