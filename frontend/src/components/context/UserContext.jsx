import React, { createContext, useState, useEffect, useContext } from "react";

// Mock User Data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

// Create UserContext
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Cek apakah ada data user di sessionStorage dan gunakan sebagai default state
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : mockUser; // Gunakan data yang tersimpan jika ada
  });

  // Simpan ke sessionStorage setiap kali user berubah
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Fungsi login
  const login = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Fungsi logout
  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  // Fungsi update sebagian data user
  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  // Fungsi reset user
  const resetUser = () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook untuk akses context dengan mudah
export const useUser = () => useContext(UserContext);
