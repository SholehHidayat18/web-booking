import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { API_URL } from "../../../constant";
import { useToast } from "../../components/context/ToastContext";
import logo from "../../assets/images/Logo1.jpg";
import InputBox from "../../components/inputbox/InputBox";
import Restriction from "../../utils/Restriction";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const validateForm = () => {
    const { phoneNumber, password } = formData;
    if (!phoneNumber || !password) {
      return "Phone Number and Password are required!";
    }
    if (!/^628\d{8,13}$/.test(phoneNumber)) {
      return "Phone number must start with 628 and be valid!";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long!";
    }
    if (!captchaToken) {
      return "Please complete the captcha!";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: formData.phoneNumber, // karena backend login pakai email, jadi mapping phoneNumber ke email
        password: formData.password,
        captcha: captchaToken,
      });

      if (response.data.status === "success") {
        showToast({ type: "success", message: response.data.message });

        const { is_admin } = response.data.user;

        // Redirect sesuai role
        if (is_admin === 1) {
          navigate("/admin");
        } else {
          navigate("/client");
        }
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Login failed",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message || "An error occurred during login",
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-5 min-h-screen pt-20">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src={logo} alt="logo" className="w-64 py-5" />
        <span className="mb-10 text-lg">Welcome back!</span>

        <form className="w-auto flex flex-col gap-4" onSubmit={handleSubmit}>
          <InputBox
            type="text"
            name="phoneNumber"
            label="Phone Number"
            value={formData.phoneNumber}
            width="100%"
            onChange={handleChange}
            flag={true}
          />
          <InputBox
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            width="100%"
            onChange={handleChange}
          />

          <ReCAPTCHA
            sitekey="6Ldi4iMrAAAAAFSs-N8sjvqgvOrwaupgVHL7Bi8f"
            onChange={handleCaptchaChange}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Login
          </button>
        </form>

        <button
          className="w-full text-blue-600 mt-4 hover:text-blue-800 hover:underline"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Register
        </button>
      </div>

      <Restriction flag={false} />
    </div>
  );
};

export default Login;
