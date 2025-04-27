import React, { useState, useRef, useContext } from "react";
import { useLoading } from "../context/LoadingContext";
import { UserContext } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { auth, signInWithPhoneNumber } from "../../utils/firebase";
import setupRecaptcha from "../../utils/recaptcha";

const OtpInput = ({ phoneNumber, setIsOtpPopupVisible }) => {
  const [otp, setOtp] = useState("");
  const { startLoading, stopLoading } = useLoading();
  const { updateUser } = useContext(UserContext);
  const { showToast } = useToast();

  const sendOtp = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = setupRecaptcha("recaptcha-container");
    }
  
    const appVerifier = window.recaptchaVerifier;
  
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        showToast("OTP terkirim ke nomor kamu.");
      })
      .catch((error) => {
        console.error(error);
        showToast("Gagal mengirim OTP, coba lagi.");
      });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    startLoading();

    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        const user = result.user;
        updateUser({ phoneNumber: user.phoneNumber });
        showToast("OTP berhasil diverifikasi!");
        setIsOtpPopupVisible(false);
        stopLoading();
      })
      .catch((error) => {
        console.error(error);
        showToast("OTP salah, coba lagi.");
        stopLoading();
      });
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-5 bg-white shadow-xl rounded-lg text-center z-[9999]">
      <p className="mb-5 text-blue-600 italic">
        Masukkan kode OTP yang dikirim ke <span className="font-bold">{phoneNumber}</span>
      </p>
      <h2 className="text-xl font-bold mb-5">Masukkan OTP</h2>

      <form onSubmit={handleOtpSubmit}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Masukkan 6 digit OTP"
          className="w-full text-center text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 mb-5"
          maxLength={6}
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 mb-3"
        >
          Verifikasi OTP
        </button>
      </form>

      <p
        className="cursor-pointer text-purple-600 hover:text-purple-800 hover:font-bold transition-colors duration-200"
        onClick={sendOtp}
      >
        Kirim ulang OTP
      </p>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default OtpInput;
