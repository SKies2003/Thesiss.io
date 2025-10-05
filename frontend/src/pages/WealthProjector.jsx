import React, { useState } from "react";
import CompanySelector from "../components/CompanySelector";
import StartingCapitalInput from "../components/StartingCapitalInput";
import TimeDurationInput from "../components/TimeDurationInput";

const WealthProjector = () => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [startingCapital, setStartingCapital] = useState('');
    const [years, setYears] = useState('');

    const handleProject = () => {
        // Add logic to project future wealth
    };

    return (
        <div className="min-h-screen bg-[#232323] flex flex-col">
            <div className="flex-1 flex flex-col py-20 ml-7">
                <h2 className="text-white text-3xl font-medium mb-2">
                    Project Your Wealth Future.
                </h2>
                <p className="text-gray-200 mb-8">
                    Choose a company, set your capital, and select your time horizon.
                </p>
                <div className="flex justify-center items-center flex-1 gap-6 h-full">
                    {/* Company Selector */}
                    <div style={{fontFamily: 'Monaco, sans-serif'}} className="bg-[#2D2C2F] rounded-xl shadow-lg p-0 w-[370px] flex flex-col items-center">
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
                    <div className="gap-6">
                    
                    {/* Starting Capital Input */}
                    <div style={{fontFamily: 'Monaco, sans-serif'}} className="bg-[#2D2C2F] rounded-xl shadow-lg p-4 w-[370px] ">
                        <StartingCapitalInput
                            value={startingCapital}
                            onChange={e => setStartingCapital(e.target.value)}
                        />
                    </div>
                    
                    {/* Time Duration Input */}
                    <div style={{fontFamily: 'Monaco, sans-serif'}} className="bg-[#2D2C2F] rounded-xl shadow-lg p-4 w-[370px] my-4.5">
                        <TimeDurationInput
                            value={years}
                            onChange={e => setYears(e.target.value)}
                        />
                    </div>
                    
                    {/* Project Button */}
                    <button
                        className="w-[370px] bg-sky-400 text-white rounded-lg py-3 font-semibold text-lg hover:bg-sky-500 cursor-pointer transition disabled:cursor-not-allowed disabled:bg-gray-400"
                        disabled={!selectedCompany || !startingCapital || !years}
                        onClick={handleProject}
                    >
                        Project My Future
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WealthProjector;
