import React, { useState, useEffect, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { UserContext } from "../context/UserContext";

const InputBox = ({
  name,
  type,
  label,
  value,
  onChange,
  width = "300px",
  maxLength = 30,
  maxDigits = 2,
  isDisabled = false,
  flag = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [responsiveWidth, setResponsiveWidth] = useState(width);
  const { user } = useContext(UserContext);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => setIsFocused(e.target.value.trim() !== "");

  const handleToggle = () => setShowPassword(!showPassword);

  const updateWidth = () => {
    if (window.innerWidth < parseInt(width)) {
      setResponsiveWidth("100%");
    } else {
      setResponsiveWidth(width);
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [width]);

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div 
      className="relative flex items-center min-w-[300px]" 
      style={{ width: responsiveWidth }}
    >
      <input
        name={name}
        type={inputType}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={isDisabled}
        required
        className={`
          w-full px-3 py-3 text-base border border-gray-400 rounded-lg
          bg-transparent outline-none transition-all duration-300
          ${isFocused || value ? "pt-5" : ""}
          ${isFocused ? "border-2 border-blue-500 shadow-md" : ""}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onInput={(e) => {
          if (type === "number" && e.target.value.length > maxDigits) {
            e.target.value = e.target.value.slice(0, maxDigits);
          }
        }}
      />

      <span className={`
        absolute left-3 transition-all duration-300 pointer-events-none
        ${isFocused || value ? 
          "text-xs -translate-y-5 bg-white px-1 text-blue-500" : 
          "text-base translate-y-0 text-gray-500"
        }
        ${flag ? "text-gray-500" : ""}
      `}>
        {label}
      </span>

      {(type === "password" || label === "Password" || label === "New Password") && (
        <button
          type="button"
          className="absolute right-3 text-gray-500 hover:text-gray-700"
          onClick={handleToggle}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}

      {label === "Email" && user.verified && flag && (
        <div className="absolute right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          <span>VERIFIED</span>
          <RiVerifiedBadgeFill className="text-white" />
        </div>
      )}
    </div>
  );
};

export default InputBox;