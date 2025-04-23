import React, { useContext, useEffect, useState } from "react";
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

const Register = () => {
  const { startLoading, stopLoading } = useLoading();
  const { user, deleteUser } = useContext(UserContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOtpPopupVisible, setIsOtpPopupVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePhoneNumber = () => {
    if (!phoneNumber) {
      return "Phone number is required!";
    }
    if (!/^628\d{8,13}$/.test(phoneNumber)) {
      return "Phone number must start with 628 and be valid!";
    }
    return null;
  };

  const validateForm = () => {
    const { fullname, password } = formData;
    if (!fullname || !password) {
      return "Full Name and Password are required!";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long!";
    }
    return null;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    startLoading();

    const validationError = validatePhoneNumber();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      stopLoading();
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/verify-phone`, {
        phoneNumber,
      });

      if (response.data.status === "success") {
        sessionStorage.setItem("phoneNumber", phoneNumber);
        setIsOtpPopupVisible(true);
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Phone verification failed",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred while sending OTP",
      });
    } finally {
      stopLoading();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    startLoading();

    const validationError = validateForm();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      stopLoading();
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        fullname: formData.fullname,
        phoneNumber,
        password: formData.password,
        isVerified: user.verified,
      });

      if (response.data.status === "success") {
        showToast({ type: "success", message: response.data.message });
        sessionStorage.removeItem("phoneNumber");
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

  useEffect(() => {
    if (sessionStorage.getItem("phoneNumber")) {
      setPhoneNumber(sessionStorage.getItem("phoneNumber"));
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center p-5 min-h-screen pt-20">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src={logo} alt="logo" className="w-64 py-5" />
        <span className="mb-10 text-lg">Your ultimate travel companion!</span>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSendOtp}>
          <InputBox
            type="text"
            name="phoneNumber"
            label="Phone Number"
            value={phoneNumber}
            width="100%"
            onChange={(e) => setPhoneNumber(e.target.value)}
            isDisabled={isOtpPopupVisible || user.verified}
            flag={true}
          />
          
          {!user.verified && (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Send OTP
            </button>
          )}
        </form>

        {user.verified && (
          <>
            <div className="w-full h-px bg-gray-300 my-6"></div>
            
            <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
              <InputBox
                type="text"
                name="fullname"
                label="Full Name"
                value={formData.fullname}
                width="100%"
                onChange={handleInputChange}
                isDisabled={!user.verified}
              />
              <InputBox
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                width="100%"
                onChange={handleInputChange}
                isDisabled={!user.verified}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Register
              </button>
            </form>
          </>
        )}

        <button
          className="w-full text-blue-600 mt-4 hover:text-blue-800 hover:underline"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>
      </div>

      {isOtpPopupVisible && (
        <OtpInput
          phoneNumber={phoneNumber}
          setIsOtpPopupVisible={setIsOtpPopupVisible}
        />
      )}
      
      <Restriction flag={isOtpPopupVisible} />
    </div>
  );
};

export default Register;