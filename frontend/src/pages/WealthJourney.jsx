import React, { useState } from "react";
import CompanySelector from "../components/CompanySelector";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/business-people-analyzing-financial-charts-computers.png";

const WealthJourney = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!selectedCompany) return;
    navigate(`/company/${encodeURIComponent(selectedCompany.symbol)}`, {
      state: { company: selectedCompany },
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0d0f12] flex items-center justify-center px-6 py-16 overflow-hidden">

      {/* ---- Background Glow Effects ---- */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[180px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/20 blur-[180px] rounded-full"></div>

      {/* ---- Grid Layout ---- */}
      <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

        {/* ---- LEFT CONTENT ---- */}
        <div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-300 to-green-300 bg-clip-text text-transparent drop-shadow-md">
            Explore Company Growth
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed mb-10 max-w-md">
            Discover long-term performance, learn how corporate events influence
            wealth creation, and build conviction backed by real data insights.
          </p>

          {/* ---- Company Selector Card ---- */}
          <div
            className="bg-[#161a20]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700/60 shadow-lg w-full max-w-md relative"
            style={{ overflow: "visible", zIndex: 40 }}
          >
            <div className="text-gray-200 text-sm font-semibold mb-2">
              Select a Company
            </div>

            {/* Company Selector */}
            <div className="rounded-xl transition hover:shadow-[0_0_15px_rgba(0,150,255,0.35)]">
              <CompanySelector
                selectedCompany={selectedCompany}
                onSelect={setSelectedCompany}
              />
            </div>

            {/* Analyze Button */}
            <button
              disabled={!selectedCompany}
              onClick={goToDashboard}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white
                bg-gradient-to-r from-blue-500 to-green-500
                hover:from-blue-400 hover:to-green-400
                disabled:bg-gray-600 disabled:cursor-not-allowed
                shadow-lg hover:shadow-blue-500/30 transition"
            >
              Analyze History
            </button>
          </div>
        </div>

        {/* ---- RIGHT IMAGE (Animated + Slight Blur) ---- */}
        <div className="flex justify-center md:justify-end">
        <img
          src={sideImage}
          alt="Company Analysis"
          className="w-[560px] md:w-[650px] drop-shadow-[0_25px_60px_rgba(0,0,0,0.55)] animate-float select-none"
        />
      </div>

      </div>

      {/* ---- Floating Animation ---- */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) }
            50% { transform: translateY(-14px) }
            100% { transform: translateY(0px) }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default WealthJourney;
