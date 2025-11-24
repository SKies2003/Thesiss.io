import { useAuth } from "../contexts/AuthContext";

const HEATMAP = [
  { label: "Large Cap", change: -0.70, span: "col-span-2" },
  { label: "Mid Cap", change: +0.11 },
  { label: "Small Cap", change: -0.34 },
  { label: "Others", change: -0.07 },
];

const stat = (label, value, accent = "text-white") => (
  <div className="flex flex-col gap-1">
    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
    <p className={`text-lg font-semibold ${accent}`}>{value}</p>
  </div>
);

const heatColor = (change) =>
  change >= 0 ? "from-emerald-500/40 to-emerald-600/20" : "from-rose-500/40 to-rose-600/20";

const PortfolioSummary = () => {
  const { user } = useAuth();
  const email = user?.email ?? "investor@thesis.io";

  return (
    <main className="min-h-screen bg-[#0f1115] text-white pt-24 pb-16 px-6 lg:px-12 font-['Montserrat']">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="rounded-4xl border border-white/5 bg-[#11141b] shadow-2xl shadow-black/40 p-7 flex flex-col gap-6 md:flex-row md:gap-10">
          <div className="flex-1 space-y-2">
            <p className="text-sm text-gray-400">Hello, {email} 🎉</p>
            <p className="text-xs text-gray-500">
              The market dropped so low, we just wanted to give it a hug and say “it’ll be okay”.
            </p>

            <div className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-6 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Current Value</p>
                <p className="text-4xl font-bold mt-2">₹ 65,069</p>
              </div>
              {stat("Invested Amount", "₹ 59,565")}
              {stat("Total P&L", "+₹ 5,503 (+9.24%)", "text-emerald-400")}
              {stat("Today’s P&L", "-₹ 662 (-1.01%)", "text-rose-400")}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-white/5">
              <span>Last updated 2 days ago</span>
            </div>
          </div>

          <div className="flex-1 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300 font-medium">Your Profit &amp; Loss</p>
              
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HEATMAP.map((block) => (
                <div
                  key={block.label}
                  className={`rounded-3xl bg-gradient-to-br ${heatColor(block.change)} p-4 flex flex-col justify-between h-32 ${block.span ?? ""}`}
                >
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p className="text-xs text-gray-200">{block.change > 0 ? "+" : ""}{block.change}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PortfolioSummary;