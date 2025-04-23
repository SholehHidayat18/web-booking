import React from "react";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Holidays from "./sections/Booking";
import Contact from "./sections/Contact";

const Home = () => {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      >
        <Hero />
      </section>

      {/* About Us Section */}
      <section
        id="aboutus"
        className="w-full py-16 bg-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <About />
        </div>
      </section>

      {/* Holidays Section */}
      <section
        id="holidays"
        className="w-full py-16 bg-gray-400"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Holidays />
        </div>
      </section>

      {/* Contact Us Section */}
      <section
        id="contactus"
        className="w-full py-16 bg-gray-700 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Contact />
        </div>
      </section>
    </div>
  );
};

export default Home;
