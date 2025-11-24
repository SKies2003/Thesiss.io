const MetricCard = ({ label, value, change = 0, positive = true, accent = "from-cyan-500/20 to-blue-500/10" }) => (
    <div className={`rounded-3xl border border-white/5 p-5 bg-gradient-to-br ${accent} shadow-xl shadow-black/30`}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value ?? "--"}</p>
      <p className={`text-xs mt-2 font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {positive ? "▲" : "▼"} {change.toFixed(2)}%
      </p>
    </div>
  );
  
  export default MetricCard;