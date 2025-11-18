import React, { useState } from "react";
import CompanySelector from "../components/CompanySelector";
import { useNavigate } from "react-router-dom";

const WealthJourney = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!selectedCompany) return;

    navigate(
      `/company/${encodeURIComponent(selectedCompany.symbol)}`,
      {
        state: { company: selectedCompany }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#232323] flex flex-col">
      <div className="flex-1 flex flex-col py-20 ml-7">
        <h2 className="text-white text-3xl font-medium mb-2">
          Analyze History of Companies.
        </h2>

        <p className="text-gray-200 mb-8">
          Select a company to begin.
        </p>

        <div className="flex flex-col justify-center items-center flex-1">
          <div
            style={{ fontFamily: "Monaco, sans-serif" }}
            className="bg-[#2D2C2F] rounded-xl shadow-lg shadow-gray-700 p-0 w-[370px] flex flex-col items-center border-2 border-gray-700 mb-8"
          >
            <div className="bg-[#393939] w-full rounded-t-xl py-2 text-center text-gray-100 font-medium">
              Choose a Nifty Giant
            </div>

            <div className="bg-white rounded-b-xl w-full">
              <CompanySelector
                selectedCompany={selectedCompany}
                onSelect={setSelectedCompany}
              />
            </div>
          </div>

          <button
            className="w-[370px] bg-sky-400 text-white rounded-lg py-3 font-semibold text-lg hover:bg-sky-500 cursor-pointer transition disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={!selectedCompany}
            onClick={goToDashboard}   // <-- IMPORTANT FIX
          >
            Analyze History
          </button>
        </div>
      </div>
    </div>
  );
};

export default WealthJourney;
