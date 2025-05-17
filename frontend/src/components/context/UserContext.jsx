import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      sessionStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Fungsi login dengan error handling
  const login = useCallback((userData) => {
    try {
      const userToStore = {
        ...userData,
        // Pastikan is_admin adalah number (sesuai database)
        is_admin: Number(userData.is_admin) || 0
      };
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  }, []);

  // Fungsi logout yang lebih aman
  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem("user");
      setUser(null);
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  }, []);

  // Update user dengan validasi
  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      if (!prev) return null;
      
      const updatedUser = { 
        ...prev, 
        ...newUserData,
        // Pastikan is_admin tetap number
        is_admin: Number(newUserData.is_admin ?? prev.is_admin)
      };
      
      try {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating user data:", error);
      }
      
      return updatedUser;
    });
  }, []);

  // Reset user (sama dengan logout tapi bisa ditambahkan logika lain)
  const resetUser = useCallback(() => {
    logout();
  }, [logout]);

  // Sync session storage dengan state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (error) {
          console.error("Error parsing user data from storage event:", error);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    setLoading(false);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        updateUser, 
        resetUser,
        loading,
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