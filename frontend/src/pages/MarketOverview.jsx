import { useMemo } from "react";
import MetricCard from "../components/MertricCard";
import MoodPill from "../components/MoodPill";
import MarketIndexRow from "../components/MarketIndexRow";
import { useTickerData } from "../hooks/useTickerData";
import { useMarketIndices } from "../hooks/useMarketIndices";

const HIGHLIGHTS = [
  { label: "NIFTY 50", symbol: "^NSEI" },
  {
    label: "SENSEX",
    symbol: "^BSESN",
    fallback: { value: 84900.71, changePercent: -0.39 },
  },
  { label: "USD/INR", symbol: "INR=X" },
  {
    label: "Gold",
    symbol: "GC=F",
    fallback: { value: 12571.08, changePercent: -0.80 },
  },
];

const SNAPSHOT_ORDER = [
  "^NSEI",
  "^CNX100",
  "^NSEBANK",
  "^CNXIT",
  "^CNXPHARMA",
  "^CNXFMCG",
  "^CNXAUTO",
  "^CNXREALTY",
  "NIFTYMIDCAP150.NS",
  "NIFTYSMLCAP250.NS",
];

const formatNumber = (value) =>
  value?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "—";

const MarketOverview = () => {
  const { data: tickerData } = useTickerData();
  const { indices, loading, error, refresh } = useMarketIndices();

  const topGainers = useMemo(() => {
    if (!tickerData?.length) return [];
    return [...tickerData]
      .filter((item) => typeof item.changePercent === "number")
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
  }, [tickerData]);

  const indexMap = useMemo(() => {
    const map = new Map();
    indices.forEach((idx) => map.set(idx.symbol, idx));
    return map;
  }, [indices]);

  const highlightCards = HIGHLIGHTS.map(({ label, symbol, fallback }) => {
  const match = indexMap.get(symbol);
  const price = match?.latestPrice ?? fallback?.value ?? null;
  const change = match?.changePercent ?? fallback?.changePercent ?? 0;

  return {
    key: symbol,
    label,
    value: price != null ? formatNumber(price) : "—",
    change,
    positive: change >= 0,
    isFallback: !match && Boolean(fallback),
  };
});

  const orderedSnapshot = SNAPSHOT_ORDER.map((symbol) => indexMap.get(symbol)).filter(
    Boolean
  );

  return (
    <main className="min-h-screen bg-[#0f1115] text-white pt-28 pb-16 px-6 lg:px-12 font-['Montserrat']">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {highlightCards.map((card, idx) => (
              <MetricCard
                key={card.key}
                label={card.label}
                value={card.value}
                change={card.change}
                positive={card.positive}
                accent={
                  idx === 0
                    ? "from-green-500/20 to-emerald-500/5"
                    : "from-slate-700/40 to-slate-900/40"
                }
              />
            ))}
          </div>

          <section className="w-full lg:w-80 rounded-3xl border border-white/5 bg-gradient-to-b from-[#151a22] to-[#0f1115] p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-300 font-medium">Top gainers</p>
              <button
                onClick={refresh}
                className="text-xs text-cyan-400 font-semibold hover:underline"
              >
                Refresh
              </button>
            </div>
            {topGainers.length === 0 ? (
              <p className="text-xs text-gray-500">No gainers available.</p>
            ) : (
              <ul className="space-y-3">
                {topGainers.map((item) => (
                  <li
                    key={item.symbol}
                    className="flex items-center justify-between border-b border-white/5 pb-3 last:border-none last:pb-0"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                        {item.company_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ₹
                        {item.value?.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-emerald-400 font-medium">
                        ▲ {item.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </header>

        <section className="rounded-3xl border border-white/5 bg-[#11141b] p-6 shadow-inner shadow-black/30">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400">Market & sectors</p>
              <h3 className="text-2xl font-semibold mt-1">Live snapshot</h3>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-800/40 shimmer" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {orderedSnapshot.map((index) => (
                <MarketIndexRow key={index.symbol} label={index.name} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MarketOverview;