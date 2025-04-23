import React, { useState, useEffect, useContext } from "react";
import InputBox from "../../components/inputbox/InputBox";
import logo from "../../assets/images/Logo1.jpg";
import Restriction from "../../utils/Restriction";
import { useLoading } from "../../components/context/LoadingContext";
import { useNavigate } from "react-router";
import { IoCloseCircleSharp } from "react-icons/io5";
import { API_URL } from "../../../constant";
import { UserContext } from "../../components/context/UserContext";
import { useToast } from "../../components/context/ToastContext";

const Login = () => {
  const { startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [forgetPasswordPopup, setForgetPasswordPopup] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [otpData, setOtpData] = useState({
    otp: "",
    newPassword: "",
  });
  const [isOtpStep, setIsOtpStep] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const { updateUser } = useContext(UserContext);
  const { showToast } = useToast();

  const validateLoginForm = () => {
    const { email, password } = formData;
    if (!email || !password) {
      return "All fields are required!";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address!";
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    startLoading();
    const validationError = validateLoginForm();
    if (validationError) {
      showToast({ type: "error", message: validationError });

      stopLoading();
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/login`, formData);

      if (response.data.status === "success") {
        showToast({ type: "success", message: "Login successful!" });

        updateUser({ token: response.data.data.token });

        setFormData({ email: "", password: "" }); // Reset form
        navigate("/booking");
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
    } finally {
      stopLoading();
    }
  };

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    startLoading();
    if (!forgetEmail) {
      showToast({ type: "error", message: "Email is required!" });

      stopLoading();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgetEmail)) {
      showToast({
        type: "error",
        message: "Please enter a valid email address!",
      });
      stopLoading();
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/forget-password`, {
        email: forgetEmail,
      });

      if (response.data.status === "success") {
        showToast({ type: "success", message: "OTP sent successfully!" });

        setIsOtpStep(true);
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred during the request",
      });
    } finally {
      stopLoading();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const { otp, newPassword } = otpData;
    if (!otp || !newPassword) {
      showToast({ type: "error", message: "All fields are required!" });

      return;
    }
    if (newPassword.length < 6) {
      showToast({
        type: "error",
        message: "Password must be at least 6 characters long!",
      });

      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/forget-password`, {
        email: forgetEmail,
        otp,
        newPassword,
      });

      if (response.data.status === "success") {
        showToast({ type: "success", message: "Password reset successful!" });

        setForgetPasswordPopup(false);
        setOtpData({ otp: "", newPassword: "" });
        setForgetEmail("");
        setIsOtpStep(false);
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Failed to reset password",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred during the request",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top
  }, []);

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/register');
    setMenuOpen(false);
  };


  return (
    <div className="flex flex-col items-center p-5 min-h-screen pt-20">
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <img src={logo} alt="logo" className="w-64 py-5" />
        <p className="mb-10 text-lg">Please, Login to continue.</p>
        
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <InputBox
            type={"email"}
            name={"email"}
            label={"Email"}
            value={formData.email}
            width={"100%"}
            onChange={handleInputChange}
          />
          <InputBox
            type={"password"}
            name={"password"}
            label={"Password"}
            value={formData.password}
            width={"100%"}
            onChange={handleInputChange}
          />
          
          <button 
            type="button" 
            className="text-blue-600 text-sm text-left hover:text-blue-800 hover:underline"
            onClick={() => setForgetPasswordPopup(true)}
          >
            Forgot Password?
          </button>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 mt-5"
          >
            Login
          </button>
        </form>

        <button href="/register" onClick={handleLoginClick}
          className="w-full text-blue-600 mt-4 hover:text-blue-800 hover:underline"
        >
          Don't have an account? Register
        </button>
      </div>

      {forgetPasswordPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setForgetPasswordPopup(false);
                setIsOtpStep(false);
                setOtpData({ otp: "", newPassword: "" });
                setForgetEmail("");
              }}
            >
              <IoCloseCircleSharp size={30} />
            </button>

            <h2 className="text-xl font-bold mb-5">
              {isOtpStep ? "Reset Password" : "Forgot Password"}
            </h2>
            
            {!isOtpStep ? (
              <form onSubmit={handleForgetPassword} className="flex flex-col gap-4">
                <InputBox
                  type={"email"}
                  label={"Email"}
                  value={forgetEmail}
                  width={"100%"}
                  onChange={(e) => setForgetEmail(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                <InputBox
                  type={"text"}
                  label={"OTP"}
                  value={otpData.otp}
                  width={"100%"}
                  onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                  maxLength="6"
                />
                <InputBox
                  type={"password"}
                  label={"New Password"}
                  value={otpData.newPassword}
                  width={"100%"}
                  onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                />
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      <Restriction flag={forgetPasswordPopup || isOtpStep} />
    </div>
  );
};

export default Login;