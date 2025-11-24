const MoodPill = ({ label, active, tone = "neutral" }) => {
    const tones = {
      bullish: "text-emerald-300 border-emerald-400/40 bg-emerald-500/5",
      bearish: "text-red-300 border-red-400/40 bg-red-500/5",
      neutral: "text-slate-300 border-slate-500/40 bg-slate-600/10",
    };
    return (
      <div className={`flex flex-col items-center gap-2 ${active ? "" : "opacity-60"}`}>
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-semibold ${tones[tone] ?? tones.neutral}`}>
          {label.slice(0, 1)}
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    );
  };
  
  export default MoodPill;