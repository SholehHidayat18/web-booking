import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import { useLoading } from "../context/LoadingContext";
import { API_URL } from "../../constant";
import { UserContext } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

const OtpInput = ({ email, setIsOtpPopupVisible }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const { startLoading, stopLoading } = useLoading();
  const [resend, setResend] = useState(false);
  const { updateUser } = useContext(UserContext);
  const { showToast } = useToast();

  // ... (keep all your existing functions unchanged)

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-5 bg-white shadow-xl rounded-lg text-center z-[9999]">
      <p className="mb-5 text-blue-600 italic">
        An OTP sent on <span className="font-bold text-blue-600 italic">{email}</span>
      </p>
      <h2 className="text-xl font-bold mb-5">Enter OTP</h2>
      
      <form onSubmit={handleOtpSubmit}>
        <div className="flex justify-between mb-5">
          {otp?.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          ))}
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 mb-5"
        >
          Submit
        </button>
        
        {resend && (
          <p 
            className="cursor-pointer text-purple-600 hover:text-purple-800 hover:font-bold transition-colors duration-200"
            onClick={() => handleResend(email)}
          >
            Resend OTP
          </p>
        )}
      </form>
    </div>
  );
};

export default OtpInput;