import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70">
      <div className="relative w-12 aspect-square animate-spin">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f03355] via-transparent to-transparent blur-sm" />
        <div className="absolute inset-0 rotate-30 rounded-full bg-gradient-to-r from-[#f03355] via-transparent to-transparent blur-sm" />
        <div className="absolute inset-0 rotate-60 rounded-full bg-gradient-to-r from-[#f03355] via-transparent to-transparent blur-sm" />
      </div>
    </div>
  );
};

export default Loader;
