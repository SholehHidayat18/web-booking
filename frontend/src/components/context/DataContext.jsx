import React, { createContext, useState, useEffect, useContext } from "react";
import { API_URL } from "../../../constant";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async (endpoint, stateSetter, storageKey) => {
      const cachedData = sessionStorage.getItem(storageKey);

      if (cachedData) {
        stateSetter(JSON.parse(cachedData));
        return;
      }

      try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.status === "success" && result.data) {
          const data = result.data;
          stateSetter(data);
          sessionStorage.setItem(storageKey, JSON.stringify(data));
        } else {
          console.error(`Failed to fetch ${endpoint}: Invalid data structure`);
        }
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
      }
    };

    fetchData("places", setPlaces, "places");
  }, []);

  const resetData = () => {
    setPlaces([]);
    sessionStorage.clear();
  };

  return (
    <DataContext.Provider value={{ places, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);