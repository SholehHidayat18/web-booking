import React, { useState } from "react";

const ToolTip = ({ message, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50 transition-opacity duration-300 opacity-100">
          {message}
        </div>
      )}
    </div>
  );
};

export default ToolTip;
