import { LineChart, Line, YAxis } from "recharts";

const formatNumber = (value) =>
    value?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "--";

const MarketIndexRow = ({ label, index }) => {
    const positive = (index?.changePercent ?? 0) >= 0;
    const deltaColor = positive ? "text-emerald-400" : "text-red-400";
    const lineColor = positive ? "#34d399" : "#f87171";

    return (
        <div className="flex items-center justify-between py-4 border-t border-white/10 first:border-t-0">
            <div className="pr-4">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-lg font-bold text-white mt-1">
                    ₹{formatNumber(index?.latestPrice)}
                </p>
                <p className={`text-xs font-semibold ${deltaColor}`}>
                    {positive ? "▲" : "▼"} {index?.changePercent?.toFixed(2) ?? "0.00"}%
                </p>
            </div>

            <LineChart width={120} height={50} data={index.sparkline}>
                <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={false} />
                <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
            </LineChart>
        </div>
    );
};

export default MarketIndexRow;