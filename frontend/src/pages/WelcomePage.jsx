import React from "react";

const WelcomePage = ({ openAuth }) => {
  return (
    <div className="relative min-h-screen bg-[#0b0d12] flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1d4ed8]/20 blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#9333ea]/15 blur-[180px]" />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* Logo */}
        <img
        src="src/assets/—Pngtree—blue stock trading graph_6050459.png"
        className="
          w-[380px]              /* was 260px → now bigger */
          mb-6 
          drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]
          transition-transform 
          duration-300
          hover:scale-105        /* subtle hover zoom */
        "
        style={{ transform: "scale(1.03)" }}   /* slight default zoom */
      />


        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Welcome to <span className="text-[#3b82f6]">Thesis.io</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base max-w-md leading-relaxed mb-10">
          Discover how real company events influence long-term growth.
          Visualize wealth, analyze history, and build your financial conviction.
        </p>

        {/* CTA Button */}
        <button
          onClick={openAuth}
          className="px-8 py-3 text-sm sm:text-base font-semibold rounded-xl 
                     bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]
                     hover:from-[#1d4ed8] hover:to-[#2563eb]
                     shadow-[0_18px_40px_rgba(37,99,235,0.45)]
                     transition-all duration-200 hover:scale-[1.02]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
