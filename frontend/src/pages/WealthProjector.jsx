import React, { useState, useRef } from "react";
import CompanySelector from "../components/CompanySelector";
import { useAuth } from "../contexts/AuthContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const WealthProjector = () => {
  const { token } = useAuth();

  const [mode, setMode] = useState("lumpsum"); // "lumpsum" | "sip"
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [amount, setAmount] = useState("");
  const [years, setYears] = useState("5");
  const [loading, setLoading] = useState(false);
  const [projection, setProjection] = useState(null);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);

  const isSIP = mode === "sip";

  /* --------- Helpers --------- */

  const parsePositiveNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const estimateCagrFromPrices = (stockPrices) => {
    if (!Array.isArray(stockPrices) || stockPrices.length < 2) return null;

    const first = stockPrices[0];
    const last = stockPrices[stockPrices.length - 1];

    const firstPrice = Number(first.price);
    const lastPrice = Number(last.price);

    if (!firstPrice || !lastPrice || firstPrice <= 0 || lastPrice <= 0) {
      return null;
    }

    const start = new Date(first.date);
    const end = new Date(last.date);
    const diffMs = end - start;
    const years =
      diffMs > 0 ? diffMs / (365.25 * 24 * 60 * 60 * 1000) : null;

    if (!years || years <= 0) return null;

    const cagr = Math.pow(lastPrice / firstPrice, 1 / years) - 1;
    if (!Number.isFinite(cagr) || cagr <= -0.99) return null;

    return cagr;
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "₹0";
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const toPercent = (value) => {
    if (value == null || isNaN(value)) return "--";
    return `${(value * 100).toFixed(2)}%`;
  };

  const buildProjections = (cagr, principal, yearsNum, isSIPMode) => {
    const r = cagr; // annual
    const months = yearsNum * 12;

    let totalInvested = 0;
    let futureValue = 0;

    if (isSIPMode) {
      const sip = principal;
      // Convert annual CAGR to monthly rate using the correct formula
      const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;

      totalInvested = sip * months;

      if (monthlyRate > 0) {
        // SIP Future Value Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
        futureValue =
          sip *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
          (1 + monthlyRate);
      } else {
        futureValue = totalInvested;
      }
    } else {
      totalInvested = principal;
      futureValue = principal * Math.pow(1 + r, yearsNum);
    }

    const gain = futureValue - totalInvested;

    // Build chart data per year (Grow-style smooth curve)
    const chartData = [];
    for (let year = 0; year <= yearsNum; year++) {
      let valueAtYear = 0;
      if (isSIPMode) {
        const m = year * 12;
        const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
        if (monthlyRate > 0 && m > 0) {
          valueAtYear =
            principal *
            ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
            (1 + monthlyRate);
        } else {
          valueAtYear = principal * m;
        }
      } else {
        valueAtYear = principal * Math.pow(1 + r, year);
      }

      chartData.push({
        label: year === 0 ? "Now" : `Year ${year}`,
        value: valueAtYear,
      });
    }

    return { totalInvested, futureValue, gain, chartData };
  };

  /* --------- Main handler --------- */

  const handleProject = async () => {
    setError("");
    setProjection(null);

    const principal = parsePositiveNumber(amount);
    const yearsNum = parsePositiveNumber(years);

    if (!selectedCompany) {
      setError("Please choose a company.");
      return;
    }
    if (!principal) {
      setError(
        isSIP
          ? "Enter a valid monthly SIP amount."
          : "Enter a valid amount to invest."
      );
      return;
    }
    if (!yearsNum) {
      setError("Enter a valid time horizon in years.");
      return;
    }
    if (!token) {
      setError("You need to be logged in to project your wealth.");
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams({
        start_date: "2020-01-01",
        end_date: today,
      });

      const res = await fetch(
        `http://localhost:8000/companies/${encodeURIComponent(
          selectedCompany.symbol
        )}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch company data");
      }

      const data = await res.json();
      const prices = data?.stock_prices || [];
      let cagr = estimateCagrFromPrices(prices);
      let usedFallback = false;

      if (!cagr || !Number.isFinite(cagr)) {
        // Fallback 12% if we can't infer from data
        cagr = 0.12;
        usedFallback = true;
      }

      const { totalInvested, futureValue, gain, chartData } = buildProjections(
        cagr,
        principal,
        yearsNum,
        isSIP
      );

      const proj = {
        cagr,
        totalInvested,
        futureValue,
        gain,
        chartData,
        usedFallback,
        mode,
      };

      setProjection(proj);

      // Smooth scroll to results (Grow-style slide down)
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 150);
    } catch (err) {
      console.error(err);
      setError("Unable to project right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --------- Donut chart data --------- */

  const buildDonutData = () => {
    if (!projection) return [];
    const invested = Math.max(0, projection.totalInvested || 0);
    const gain = Math.max(0, projection.gain || 0);
    const total = invested + gain || 1;

    return [
      { name: "Invested amount", value: invested },
      { name: "Est. returns", value: gain },
    ].map((d) => ({
      ...d,
      // tiny protection so donut is always visible
      value: d.value <= 0 ? total * 0.02 : d.value,
    }));
  };

  const donutColors = ["#1f2937", "#4f46e5"]; // invested, returns

  /* --------- UI --------- */

  return (
    <div className="relative min-h-screen bg-[#050712] text-white pt-16 pb-14 px-4 md:px-8 overflow-hidden">
      {/* Soft background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-sky-500/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full bg-emerald-500/15 blur-[160px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Top: heading + mode toggle */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Project </span>
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Your Wealth Journey
            </span>
          </h1>
          <p className="text-sm md:text-[15px] text-slate-300 max-w-2xl">
            Pick a company, choose your investment style, and estimate what your
            money could grow to, using historical price trends as a guide.
          </p>

          {/* Mode toggle */}
          <div className="inline-flex mt-5 rounded-full bg-black/40 border border-white/10 p-1 text-xs md:text-sm">
            <button
              type="button"
              onClick={() => setMode("lumpsum")}
              className={`px-4 md:px-5 py-1.5 rounded-full transition ${
                !isSIP
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Lumpsum
            </button>
            <button
              type="button"
              onClick={() => setMode("sip")}
              className={`px-4 md:px-5 py-1.5 rounded-full transition ${
                isSIP
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              SIP (monthly)
            </button>
          </div>
        </header>

        {/* Main top section: left card + right info card */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-7 items-start">
          {/* LEFT: plan card – wrapper styled like WealthJourney */}
          <div className="bg-[#111827]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700/60 shadow-lg w-full max-w-xl">
            <h2 className="text-base md:text-lg font-semibold mb-1">
              {isSIP ? "Plan your SIP investment" : "Plan your lumpsum investment"}
            </h2>
            <p className="text-[11px] md:text-xs text-slate-300 mb-5 max-w-md">
              {isSIP
                ? "Choose a company and monthly SIP amount to see how your contributions might grow over time."
                : "Choose a one-time amount and time horizon to see its potential future value based on past trends."}
            </p>

            {/* ---- Company Selector block, same feel as WealthJourney ---- */}
            <div className="mb-5">
              <div className="text-gray-200 text-sm font-semibold mb-2">
                Select a Company
              </div>
              <div className="rounded-xl transition hover:shadow-[0_0_15px_rgba(0,150,255,0.35)] text-black">
              <CompanySelector
                selectedCompany={selectedCompany}
                onSelect={setSelectedCompany}
              />
            </div>

            </div>

            {/* Investment amount */}
            <div className="mb-4">
              <label className="block text-xs text-slate-200 mb-1.5">
                {isSIP ? "Monthly SIP Amount (₹)" : "Investment Amount (₹)"}
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={isSIP ? "e.g. 5,000 per month" : "e.g. 1,00,000"}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {isSIP && (
                <p className="mt-1 text-[11px] text-slate-400">
                  This is the amount you would invest every month via SIP.
                </p>
              )}
            </div>

            {/* Time horizon */}
            <div className="mb-5">
              <label className="block text-xs text-slate-200 mb-1.5">
                Time Horizon (Years)
              </label>
              <input
                type="number"
                min="1"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Longer horizons smooth out volatility and highlight compounding.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleProject}
              className="w-full mt-1 py-3 rounded-lg font-semibold text-sm md:text-[15px]
                bg-gradient-to-r from-sky-500 to-emerald-500
                hover:from-sky-400 hover:to-emerald-400
                disabled:bg-slate-600 disabled:cursor-not-allowed
                shadow-[0_18px_40px_rgba(56,189,248,0.45)] transition"
            >
              {loading ? "Calculating..." : "Project My Future"}
            </button>
          </div>

          {/* RIGHT: brief explanation card */}
          <div className="bg-[#020617]/80 border border-white/10 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.75)] backdrop-blur-md p-6 text-xs md:text-[13px] text-slate-200">
            <h3 className="text-sm md:text-base font-semibold mb-3">
              How we use historical data
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                We estimate a <span className="text-sky-400 font-semibold">CAGR</span>{" "}
                from the company&apos;s past price history.
              </li>
              <li>
                That CAGR is then used to simulate either a{" "}
                <span className="font-semibold">lumpsum</span> or{" "}
                <span className="font-semibold">monthly SIP</span> investment over
                your chosen time horizon.
              </li>
              <li>
                These numbers are <span className="font-semibold">illustrative</span>{" "}
                – not advice or guaranteed returns.
              </li>
            </ul>
          </div>
        </div>

        {/* RESULTS SECTION – slides into view when projection exists */}
        <div ref={resultsRef} className="mt-10">
          {projection && (
            <div className="bg-[#050814]/95 border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-md p-6 md:p-8">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                    Est. CAGR (based on history)
                  </div>
                  <div className="text-emerald-400 font-semibold text-lg">
                    {toPercent(projection.cagr)}
                  </div>
                  {projection.usedFallback && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Using a generic estimate where history is incomplete.
                    </p>
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                    Total Invested
                  </div>
                  <div className="text-slate-100 font-semibold text-lg">
                    {formatCurrency(projection.totalInvested)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                    Estimated Value
                  </div>
                  <div className="text-sky-400 font-semibold text-lg">
                    {formatCurrency(projection.futureValue)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                    Estimated Gain
                  </div>
                  <div className="text-emerald-400 font-semibold text-lg">
                    {formatCurrency(projection.gain)}
                  </div>
                </div>
              </div>

              {/* Area chart + donut row */}
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)] gap-8 items-stretch">
                {/* Area chart */}
                <div className="h-[260px] md:h-[320px]">
                  <h3 className="text-sm font-semibold text-slate-100 mb-3">
                    {projection.mode === "sip"
                      ? "SIP portfolio growth over time"
                      : "Lumpsum portfolio growth over time"}
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projection.chartData}>
                      <defs>
                        <linearGradient id="projLine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#111827"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        tickFormatter={(v) =>
                          v >= 1_00_00_000
                            ? `${(v / 1_00_00_000).toFixed(1)}Cr`
                            : v >= 1_00_000
                            ? `${(v / 1_00_000).toFixed(1)}L`
                            : v.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderRadius: "0.75rem",
                          border: "1px solid #1f2937",
                          fontSize: 11,
                          padding: "8px 10px",
                        }}
                        formatter={(val) => [
                          formatCurrency(val).replace("₹", ""),
                          "Value",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#38bdf8"
                        strokeWidth={2.4}
                        fill="url(#projLine)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut chart */}
                <div className="flex flex-col items-center justify-center">
                  <PieChart width={240} height={240}>
                    <Pie
                      data={buildDonutData()}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {buildDonutData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={donutColors[index % donutColors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="flex gap-6 mt-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-[#1f2937]" />
                      <span>Invested amount</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-[#4f46e5]" />
                      <span>Est. returns</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation cards below chart (Grow-style) */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#020617] border border-white/10 rounded-2xl px-4 py-4">
                  <h4 className="font-semibold mb-2">
                    {projection.mode === "sip"
                      ? "How this SIP projection works"
                      : "How this lumpsum projection works"}
                  </h4>
                  {projection.mode === "sip" ? (
                    <>
                      <p className="text-slate-300 mb-2">
                        For a SIP, we invest a fixed amount every month and compound
                        it at the monthly equivalent rate derived from the annual CAGR.
                      </p>
                      <p className="text-slate-400 mb-1">
                        Formula used (SIP):
                      </p>
                      <p className="text-slate-400">
                        FV = P ×{" "}
                        <span className="font-mono">
                          ((1 + i)<sup>n</sup> − 1) ÷ i
                        </span>{" "}
                        × (1 + i)
                      </p>
                      <p className="text-slate-500 mt-1">
                        where P is your monthly SIP, i is monthly rate = (1 + r)
                        <sup>1/12</sup> − 1, r is annual CAGR, n is total months.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-300 mb-2">
                        For a lumpsum, we grow your one-time investment at the
                        estimated CAGR over your selected time period.
                      </p>
                      <p className="text-slate-400 mb-1">
                        Formula used (lumpsum):
                      </p>
                      <p className="text-slate-400">
                        FV = P × (1 + r)
                        <sup>n</sup>
                      </p>
                      <p className="text-slate-500 mt-1">
                        where P is your investment, r is annual CAGR, n is number of
                        years.
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-[#020617] border border-white/10 rounded-2xl px-4 py-4">
                  <h4 className="font-semibold mb-2">
                    Important things to know
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>
                      • Past performance is{" "}
                      <span className="font-semibold">not</span> a guarantee of
                      future returns.
                    </li>
                    <li>
                      • Actual results can differ due to valuations, earnings,
                      news, and broader market cycles.
                    </li>
                    <li>
                      • Use these projections to build{" "}
                      <span className="font-semibold">intuition and scenarios</span>,
                      not as investment advice.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WealthProjector;
