import React, { useEffect, useState } from "react";

const TickerTape = () => {
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/companies/ticker");
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTickerData(data);
          }
        }
      } catch (e) {
        console.log("Ticker offline");
      }
    };

    fetchTicker();
  }, []);

  if (!tickerData || tickerData.length === 0) return null;

  const loopData = [...tickerData, ...tickerData, ...tickerData, ...tickerData];

  return (
    <div className="fixed top-14 left-0 w-full z-30 bg-[#0b0d12] border-b border-white/10 h-10 flex items-center overflow-hidden shadow-lg">
      
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0b0d12] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0b0d12] to-transparent z-20 pointer-events-none" />

      <div className="flex animate-ticker hover:[animation-play-state:paused]">
        {loopData.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="flex items-center gap-3 px-6 whitespace-nowrap text-xs border-r border-white/5"
          >
            {/* CHANGED HERE: Display company_name instead of symbol */}
            <span className="font-bold text-slate-200 tracking-wide">
              {item.company_name}
            </span>
            
            <span className="text-slate-400 font-mono">
              {item.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            
            <span
              className={`flex items-center font-medium ${
                item.is_profit ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {item.is_profit ? "▲" : "▼"} {item.change_percent?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;