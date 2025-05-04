import React, { useContext, useState } from "react";
import axios from "axios";
import InputBox from "../../components/inputbox/InputBox";
import logo from "../../assets/images/Logo1.jpg";
import Restriction from "../../utils/Restriction";
import OtpInput from "../../components/inputbox/OtpInput";
import { useLoading } from "../../components/context/LoadingContext";
import { useNavigate } from "react-router";
import { API_URL } from "../../../constant";
import { UserContext } from "../../components/context/UserContext";
import { useToast } from "../../components/context/ToastContext";
import { auth, signInWithPhoneNumber } from "../../utils/firebase";
import setupRecaptcha from "../../utils/recaptcha";

const Register = () => {
  const { startLoading, stopLoading } = useLoading();
  const { deleteUser } = useContext(UserContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isOtpPopupVisible, setIsOtpPopupVisible] = useState(false);
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const errors = {};
    if (!userData.fullname) errors.fullname = "Full Name is required!";
    if (!userData.email) errors.email = "Email is required!";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email))
      errors.email = "Invalid email format!";
      if (!userData.phoneNumber) errors.phoneNumber = "Phone number is required!";
      else {
        const phoneNumber = formatPhoneNumber(userData.phoneNumber);
      
      // Validasi format nomor dengan regex internasional
      if (!/^\+62\d{8,13}$/.test(phoneNumber)) {
        errors.phoneNumber = "Phone number must start with +62 and be valid!";
      }
    
      userData.phoneNumber = phoneNumber;
    }
    if (!userData.password) errors.password = "Password is required!";
    else if (userData.password.length < 6)
      errors.password = "Password must be at least 6 characters!";
    return errors;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    startLoading();
    
    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      showToast({
        type: "error",
        message: Object.values(errors).join(", "),
      });
      stopLoading();
      return;
    }
  
    // Clear recaptcha lama
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = setupRecaptcha("recaptcha-container-register");
    }

    const appVerifier = window.recaptchaVerifier;
  
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, userData.phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      sessionStorage.setItem("registerData", JSON.stringify(userData));
      setIsOtpPopupVisible(true);
      showToast({ type: "success", message: "OTP terkirim ke nomor kamu" });
    } catch (error) {
      console.error(error);
      showToast({ type: "error", message: "Gagal mengirim OTP" });
    } finally {
      stopLoading();
    }
  };
  

  const handleRegisterAfterOtp = async () => {
    startLoading();
    const registerData = JSON.parse(sessionStorage.getItem("registerData"));

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        ...registerData,
        isVerified: true,
      });

      if (response.data.status === "success") {
        showToast({ type: "success", message: response.data.message });
        sessionStorage.removeItem("registerData");
        deleteUser();
        navigate("/login");
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Registration failed",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred during registration",
      });
    } finally {
      stopLoading();
    }
  };

  const formatPhoneNumber = (number) => {
    let phone = number.trim();
    if (phone.startsWith("0")) {
      phone = "+62" + phone.slice(1);
    } else if (!phone.startsWith("+62")) {
      phone = "+62" + phone;
    }
    return phone;
  };

  return (
    <div className="flex flex-col items-center p-5 min-h-screen pt-20">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src={logo} alt="logo" className="w-64 py-5" />
        <span className="mb-5 text-lg">Register your account</span>

        <form className="w-auto flex flex-col gap-3" onSubmit={handleSendOtp}>
          <InputBox
            type="text"
            name="fullname"
            label="Full Name"
            value={userData.fullname}
            onChange={handleInputChange}
          />
          <InputBox
            type="email"
            name="email"
            label="Email"
            value={userData.email}
            onChange={handleInputChange}
          />
          <InputBox
            type="text"
            name="phoneNumber"
            label="Phone Number"
            value={userData.phoneNumber}
            onChange={handleInputChange}
            flag={true}
          />
          <InputBox
            type="password"
            name="password"
            label="Password"
            value={userData.password}
            onChange={handleInputChange}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Send OTP
          </button>
        </form>

        <button
          className="w-full text-blue-600 mt-4 hover:underline"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>
      </div>

      {isOtpPopupVisible && (
        <OtpInput
          phoneNumber={userData.phoneNumber}
          setIsOtpPopupVisible={setIsOtpPopupVisible}
          onSuccess={handleRegisterAfterOtp}
        />
      )}

      {/* Recaptcha container khusus Register */}
      <div id="recaptcha-container-register"></div>

      <Restriction flag={isOtpPopupVisible} />
    </div>
  );
};

export default Register;
