import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/corporate-green-business-arrow-showing-upward-trend.png";

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-[#0f1115] overflow-hidden">

      {/* ---- Animated Background ---- */}
      <div
        className="absolute inset-0 opacity-[0.12] animate-slowFloat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right -10% bottom -20%",
          filter: "blur(6px)",
        }}
      ></div>

      {/* ---- Content ---- */}
      <div className="relative flex flex-col md:flex-row items-center justify-center min-h-screen p-8">

{/* Left Illustration */}
<div className="relative flex justify-center md:justify-start w-full md:w-auto">
  <img
    src="src/assets/—Pngtree—green red trading candlestick chart_20522222.png"
    alt="Growth Chart"
    className="
      w-[340px]
      sm:w-[420px]
      md:w-[520px]
      lg:w-[600px]
      xl:w-[650px]
      -ml-4
      sm:-ml-10
      md:-ml-16
      lg:-ml-20
      xl:-ml-24
      mb-8 md:mb-0
      drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]
      transition-all
    "
  />
</div>


        {/* Right Text Section */}
        <div className="max-w-lg text-center md:text-left">
          <h2 className="text-white text-3xl font-semibold leading-snug mb-4">
            Grow your Fortune with  
            <span className="text-green-400"> Event-Driven Compounding</span>
          </h2>

          <p className="text-gray-300 mb-8 text-[15px] leading-relaxed">
            Thesis.io helps you visualize how corporate milestones,
            financial performance, and long-term events shape real wealth.
            Build conviction — backed by data.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center md:justify-start">

            <Link to="/wealth-journey">
              <button className="px-5 w-43 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/30 transition">
                Analyze History
              </button>
            </Link>

            <Link to="/wealth-projector">
              <button className="px-5 w-43 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg hover:shadow-blue-500/30 transition">
                Project Wealth
              </button>
            </Link>

            <Link to="/market-overview">
              <button className="px-5 w-43 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg hover:shadow-green-500/30 transition">
                Market Overview
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* ---- Animation Keyframes ---- */}
      <style>
        {`
          @keyframes slowFloat {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-18px) translateX(-12px); }
            100% { transform: translateY(0px) translateX(0px); }
          }

          .animate-slowFloat {
            animation: slowFloat 10s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;
