import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import NavbarClient from "./NavbarClient";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrUrl, setQrUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    // Kalau ga ada data di state, redirect
    if (!location.state || !location.state.totalPrice || !location.state.bookingId) {
      navigate("/client");
      return;
    }

    // Ambil data dari state
    const { totalPrice, bookingId } = location.state;
    setTotalPrice(totalPrice);
    setBookingId(bookingId);

    const generateQr = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/v1/payment/qris", {
          booking_id: bookingId,
          total_price: totalPrice
        });
        setQrUrl(response.data.qr_code_url); // <- pakai key yang bener sesuai responsenya
      } catch (err) {
        console.error("QRIS gagal:", err);
        alert("Gagal generate QR code");
      }
    };

    generateQr();
  }, [location.state, navigate]);

  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Pembayaran QRIS</h1>
        <p className="mb-4 text-lg">Total Pembayaran: Rp {totalPrice.toLocaleString("id-ID")}</p>

        {qrUrl ? (
          <img src={qrUrl} alt="QRIS Payment" className="mx-auto w-64 h-64" />
        ) : (
          <p>Memuat QR Code...</p>
        )}

        <button
          onClick={() => {
            navigate("/client");
          }}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kembali ke Beranda
        </button>
      </div>
    </>
  );
}

export default Payment;
