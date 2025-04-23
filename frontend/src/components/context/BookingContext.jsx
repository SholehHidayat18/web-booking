// src/context/BookingContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

// Membuat BookingContext
export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState({
    kamar: [],
    ruang: [],
    lapangan: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ambil data booking saat pertama kali komponen dimuat
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Gantilah URL ini dengan endpoint API backend kamu
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError("Gagal memuat data booking.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  // Fungsi untuk menambahkan booking baru
  const addBooking = async (type, bookingData) => {
    setLoading(true);
    try {
      // Gantilah URL ini dengan endpoint API backend kamu
      const response = await fetch(`/api/bookings/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const newBooking = await response.json();
        setBookings((prevBookings) => ({
          ...prevBookings,
          [type]: [...prevBookings[type], newBooking],
        }));
      }
    } catch (err) {
      setError("Gagal menambahkan booking.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memperbarui booking
  const updateBooking = async (type, bookingId, updatedData) => {
    setLoading(true);
    try {
      // Gantilah URL ini dengan endpoint API backend kamu
      const response = await fetch(`/api/bookings/${type}/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings((prevBookings) => ({
          ...prevBookings,
          [type]: prevBookings[type].map((booking) =>
            booking.id === bookingId ? updatedBooking : booking
          ),
        }));
      }
    } catch (err) {
      setError("Gagal memperbarui booking.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus booking
  const deleteBooking = async (type, bookingId) => {
    setLoading(true);
    try {
      // Gantilah URL ini dengan endpoint API backend kamu
      const response = await fetch(`/api/bookings/${type}/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings((prevBookings) => ({
          ...prevBookings,
          [type]: prevBookings[type].filter((booking) => booking.id !== bookingId),
        }));
      }
    } catch (err) {
      setError("Gagal menghapus booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        addBooking,
        updateBooking,
        deleteBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook untuk akses context dengan mudah
export const useBooking = () => useContext(BookingContext);
