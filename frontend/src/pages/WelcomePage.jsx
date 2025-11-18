import React from "react";

const WelcomePage = ({ openAuth }) => {
  return (
    <div className="bg-[#232323] min-h-screen flex flex-col justify-center items-center text-white px-6">

      <img
        src="/src/assets/image-removebg-preview (1) 1 (1).png"
        className="w-[300px] mb-6 opacity-90"
      />

      <h1 className="text-4xl font-bold mb-3 text-center">
        Welcome to Thesis.io
      </h1>

      <p className="text-gray-300 text-center max-w-xl mb-8">
        Track event-driven compounding and project future wealth.  
        Login or Sign Up to get started.
      </p>

      <button
        onClick={openAuth}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold transition"
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomePage;
