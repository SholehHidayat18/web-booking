import React, { useState , useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../constant";
import { useToast } from "../../components/context/ToastContext";
import { useUser } from "../../components/context/UserContext";
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
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();
  const { login } = useUser();
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
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!/^\+62\d{8,13}$/.test(formattedPhone)) {
      return "Phone number must start with +62 and be valid!";
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
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        phoneNumber: formatPhoneNumber(formData.phoneNumber),
        password: formData.password,
        captcha: captchaToken,
      });

      const { status, message: msg, token, user } = response.data;

      if (status === "success") {
        showToast({ type: "success", message: msg });

        // Simpan token di localStorage
        localStorage.setItem("adminToken", token);

        // Update context user state
        login(user);

        // Redirect berdasarkan role
        if (user.is_admin === 1) {
          navigate("/admin/dashboard");
        } else {
          navigate("/client");
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.response?.data?.message || "Login failed",
      });
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center p-5 min-h-screen pt-20">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src={logo} alt="logo" className="w-64 py-5" />
        <span className="mb-10 text-lg">Selamat Datang!</span>

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
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Login"
            )}
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
