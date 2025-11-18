// src/pages/CompanyDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  Brush,
  AreaChart,
  Area,
  ComposedChart, 
} from "recharts";

/* ---------- Helpers ---------- */

const TIME_RANGES = [
  { key: "1M", label: "1M", months: 1 },
  { key: "6M", label: "6M", months: 6 },
  { key: "1Y", label: "1Yr", years: 1 },
  { key: "5Y", label: "5Yr", years: 5 },
  { key: "ALL", label: "Max", all: true },
];

const actionColors = {
  DIVIDEND: "#10b981", // green
  FINANCIAL: "#ef4444", // red
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatAxisPrice = (value) => {
  if (value == null || isNaN(value)) return "";
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const formatPrice = (value) => {
  if (value == null || isNaN(value)) return "--";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatCurrency = (value, withSymbol = true) => {
  if (value == null || isNaN(value)) return "--";
  const abs = Math.abs(value);

  if (abs >= 1_00_00_000) {
    // 1 Cr = 1e7
    return `${withSymbol ? "₹" : ""}${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    // 1 Lakh
    return `${withSymbol ? "₹" : ""}${(value / 1_00_000).toFixed(2)} L`;
  }
  return `${withSymbol ? "₹" : ""}${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

// Add MA fields (ma10/ma20/ma50) to sorted [{date, price}, ...]
const addMovingAverages = (sortedPrices) => {
  const periods = [10, 20, 50];
  const sums = { 10: 0, 20: 0, 50: 0 };
  const queues = { 10: [], 20: [], 50: [] };

  return sortedPrices.map((pt) => {
    const updated = { ...pt };

    periods.forEach((period) => {
      const price = pt.price;
      if (price == null || isNaN(price)) return;

      queues[period].push(price);
      sums[period] += price;
      if (queues[period].length > period) {
        sums[period] -= queues[period].shift();
      }

      if (queues[period].length === period) {
        updated[`ma${period}`] = sums[period] / period;
      }
    });

    return updated;
  });
};
const generateScreenerTicks = (min, max) => {
    if (!min || !max) return [];
  
    const range = max - min;
    let step = 100;
  
    if (range > 2000) step = 200;
    if (range > 4000) step = 500;
    if (range > 8000) step = 1000;
  
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
  
    const ticks = [];
    for (let v = start; v <= end; v += step) {
      ticks.push(v);
    }
    return ticks;
  };
  
/* ---------- Component ---------- */

const CompanyDashboard = () => {
  const { symbol: symbolParam } = useParams();
  const symbol = decodeURIComponent(symbolParam);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [companyData, setCompanyData] = useState(null);
  const [timeRange, setTimeRange] = useState("1Y");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maOptions, setMaOptions] = useState({
    show10: false,
    show20: true,
    show50: true,
  });

  const selectedCompanyFromState = location.state?.company;

  /* ---------- Fetch data ---------- */

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Please login to view this dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const today = new Date().toISOString().slice(0, 10);
        const params = new URLSearchParams({
          start_date: "2020-01-01",
          end_date: today,
        });

        const res = await fetch(
          `http://localhost:8000/companies/${encodeURIComponent(
            symbol
          )}?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        setCompanyData(data);
      } catch (e) {
        console.error(e);
        setError("Unable to load company data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, token]);

  /* ---------- Compute chart & stats ---------- */

  const {
    chartData,
    filteredEvents,
    stats,
    latestFinancials,
  } = useMemo(() => {
    if (!companyData?.stock_prices?.length) {
      return {
        chartData: [],
        filteredEvents: [],
        stats: {},
        latestFinancials: {},
      };
    }

    const rawPrices = [...companyData.stock_prices]
      .map((p) => ({ 
        date: p.date, 
        price: Number(p.price),
        volume: Number(p.volume || 0), 
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const financials = companyData.financials || [];
    const actions = companyData.corporate_actions || [];

    // Add MA10/20/50 to full series
    let enriched = addMovingAverages(rawPrices);

    // Attach financials (revenue, net_income)
    const mapByDate = new Map(enriched.map((p) => [p.date, { ...p }]));
    financials.forEach((f) => {
      const rec = mapByDate.get(f.date);
      if (!rec) return;
      rec.revenue = f.total_revenue ?? null;
      rec.net_income = f.net_income ?? null;

      if (f.total_revenue > 0 && f.net_income != null) {
        rec.hasFinancial = true;
      }
      mapByDate.set(f.date, rec);
    });
    enriched = Array.from(mapByDate.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Determine range
    const minDate = new Date(enriched[0].date);
    const maxDate = new Date(enriched[enriched.length - 1].date);

    let fromDate = minDate;
    if (timeRange !== "ALL") {
      const cfg = TIME_RANGES.find((t) => t.key === timeRange);
      const d = new Date(maxDate);
      if (cfg?.months) d.setMonth(d.getMonth() - cfg.months);
      if (cfg?.years) d.setFullYear(d.getFullYear() - cfg.years);
      if (d < minDate) d = minDate;
      fromDate = d;
    }

    const inRange = enriched.filter((pt) => {
      const d = new Date(pt.date);
      return d >= fromDate && d <= maxDate;
    });

    const pricesInRange = inRange
      .map((p) => p.price)
      .filter((v) => v != null && !isNaN(v));

    const latestPrice =
      pricesInRange.length > 0 ? pricesInRange[pricesInRange.length - 1] : null;
    const highPrice =
      pricesInRange.length > 0 ? Math.max(...pricesInRange) : null;
    const lowPrice =
      pricesInRange.length > 0 ? Math.min(...pricesInRange) : null;
    const volatility =
      highPrice != null && lowPrice != null ? highPrice - lowPrice : null;

    const prevIndex =
      pricesInRange.length > 5 ? pricesInRange.length - 6 : 0;
    const previousPrice =
      pricesInRange.length > 0 ? pricesInRange[prevIndex] : null;

    const priceChangeAbs =
      latestPrice != null && previousPrice != null
        ? latestPrice - previousPrice
        : null;
    const priceChangePct =
      latestPrice != null && previousPrice
        ? (priceChangeAbs / previousPrice) * 100
        : null;

    const lastPoint = inRange[inRange.length - 1] || {};
    const ma20 = lastPoint.ma20 ?? null;

    // Dividend events (green dots)
    const events = [];
    actions.forEach((e) => {
      if (e.action_type !== "DIVIDEND") return;
      const rec = inRange.find((p) => p.date === e.date);
      if (!rec || rec.price == null || isNaN(rec.price)) return;
      events.push({
        id: e.id,
        date: e.date,
        price: rec.price,
        action_type: "DIVIDEND",
        details: e.details,
      });
    });

    // Financial events (red dots) using enriched data
    inRange
      .filter((p) => p.hasFinancial && p.price != null && !isNaN(p.price))
      .forEach((p) => {
        events.push({
          id: `financial-${p.date}`,
          date: p.date,
          price: p.price,
          action_type: "FINANCIAL",
          details: {
            revenue: p.revenue,
            net_income: p.net_income,
          },
        });
      });

    // Latest financial summary
    const latestFin =
      financials
        .filter(
          (f) => f.total_revenue != null && f.net_income != null
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

    const latestFinancials = latestFin
      ? {
          revenue: latestFin.total_revenue,
          net_income: latestFin.net_income,
          date: latestFin.date,
          margin:
            latestFin.total_revenue !== 0
              ? (latestFin.net_income / latestFin.total_revenue) * 100
              : null,
        }
      : {};

    return {
      chartData: inRange,
      filteredEvents: events,
      stats: {
        latestPrice,
        highPrice,
        lowPrice,
        volatility,
        priceChangeAbs,
        priceChangePct,
        ma20,
      },
      latestFinancials,
    };
  }, [companyData, timeRange]);

  const {
    latestPrice,
    highPrice,
    lowPrice,
    volatility,
    priceChangeAbs,
    priceChangePct,
    ma20,
  } = stats || {};

  const companyName =
    selectedCompanyFromState?.company_name || companyData?.company_name || "";
  const uiSymbol =
    (selectedCompanyFromState?.symbol ||
      companyData?.symbol ||
      ""
    ).replace(".NS", "");

  // For Y-axis domain padding
  const domainMin =
    lowPrice != null ? lowPrice * 0.95 : "auto";
  const domainMax =
    highPrice != null ? highPrice * 1.05 : "auto";

  /* ---------- Tooltip ---------- */

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const point =
      payload.find((p) => p.dataKey === "price")?.payload ||
      payload[0].payload;

    const eventsOnDate = filteredEvents.filter((e) => e.date === label);

    return (
      <div className="bg-[#18181B] text-white text-xs rounded-lg px-3 py-2 border border-gray-600 shadow-xl font-sans">
        <div className="font-semibold mb-1">{formatDate(label)}</div>

        {point.price != null && (
          <div className="mb-1">Price: {formatPrice(point.price)}</div>
        )}
        
        {/* Removed volume from tooltip as requested */}

        {maOptions.show10 && point.ma10 != null && (
          <div className="mb-0.5">10-MA: {formatPrice(point.ma10)}</div>
        )}
        {maOptions.show20 && point.ma20 != null && (
          <div className="mb-0.5">20-MA: {formatPrice(point.ma20)}</div>
        )}
        {maOptions.show50 && point.ma50 != null && (
          <div className="mb-0.5">50-MA: {formatPrice(point.ma50)}</div>
        )}

        {eventsOnDate.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            {eventsOnDate.map((e) => (
              <div
                key={e.id}
                className={`flex items-center gap-2 ${
                  e.action_type === "FINANCIAL"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: actionColors[e.action_type] || "#fff",
                  }}
                />
                {e.action_type === "DIVIDEND" && (
                  <>
                    <span className="font-semibold">DIVIDEND:</span>
                    <span>{formatPrice(e.details?.value)}</span>
                  </>
                )}
                {e.action_type === "FINANCIAL" && (
                  <>
                    <span className="font-semibold">FINANCIAL:</span>
                    <span className="text-[#10b981]">
                      Rev {formatCurrency(e.details?.revenue, false)}
                    </span>
                    <span className="text-[#f472b6] ml-2">
                      Prof {formatCurrency(e.details?.net_income, false)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ---------- Loading / error ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#232323] text-white flex items-center justify-center pt-16">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#232323] text-white flex flex-col items-center justify-center pt-16">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          onClick={() => navigate("/wealth-journey")}
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm"
        >
          Back to company selection
        </button>
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-[#232323] text-white pt-16 pb-10 font-sans">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto bg-[#111111] rounded-b-2xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-semibold">
            {companyName?.[0] || uiSymbol?.[0] || "C"}
          </div>
          <div>
            <div className="text-xl font-semibold">
              {companyName || "Company"}
            </div>
            <div className="text-gray-400 text-sm">{uiSymbol}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400">Current Price</div>
          <div className="text-2xl font-bold">{formatPrice(latestPrice)}</div>
          {priceChangePct != null && (
            <div
              className={`text-xs mt-1 font-semibold ${
                priceChangeAbs >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {priceChangeAbs >= 0 ? "▲" : "▼"}{" "}
              {priceChangeAbs?.toFixed?.(2) ?? "--"} (
              {priceChangePct?.toFixed?.(2) ?? "--"}%)
            </div>
          )}
        </div>
      </div>

      {/* TOP STATS BAR */}
      <div className="max-w-6xl mx-auto mt-6 bg-[#18181B] rounded-xl px-6 py-4 shadow-xl flex justify-between flex-wrap text-sm">
        <div className="flex flex-col items-center p-3 w-[18%]">
          <span className="text-gray-400 mb-1">• Current Price</span>
          <span className="font-bold text-lg text-[#3b82f6]">
            {formatPrice(latestPrice)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 w-[18%]">
          <span className="text-gray-400 mb-1">↑ High</span>
          <span className="font-bold text-lg">
            {formatPrice(highPrice)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 w-[18%]">
          <span className="text-gray-400 mb-1">↓ Low</span>
          <span className="font-bold text-lg">
            {formatPrice(lowPrice)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 w-[18%]">
          <span className="text-gray-400 mb-1">≈ Volatility</span>
          <span className="font-bold text-lg">
            {volatility != null ? formatPrice(volatility) : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 w-[18%]">
          <span className="text-gray-400 mb-1">20-MA</span>
          <span className="font-bold text-lg text-yellow-400">
            {formatPrice(ma20)}
          </span>
        </div>
      </div>

      {/* TIME RANGE + MA TOGGLES */}
      <div className="max-w-6xl mx-auto mt-6 flex gap-2 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          {TIME_RANGES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTimeRange(t.key)}
              className={`px-3 py-1.5 text-xs rounded-full border ${
                timeRange === t.key
                  ? "bg-white text-black border-white"
                  : "border-gray-500 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 ml-6 text-xs text-gray-200">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 bg-gray-700 border-gray-500 rounded"
              checked={maOptions.show10}
              onChange={() =>
                setMaOptions((p) => ({ ...p, show10: !p.show10 }))
              }
            />
            <span className="ml-1.5">10-Day MA</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 bg-gray-700 border-gray-500 rounded"
              checked={maOptions.show20}
              onChange={() =>
                setMaOptions((p) => ({ ...p, show20: !p.show20 }))
              }
            />
            <span className="ml-1.5">20-Day MA</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 bg-gray-700 border-gray-500 rounded"
              checked={maOptions.show50}
              onChange={() =>
                setMaOptions((p) => ({ ...p, show50: !p.show50 }))
              }
            />
            <span className="ml-1.5">50-Day MA</span>
          </label>
        </div>
      </div>

      {/* MAIN CHART */}
      <div className="max-w-6xl mx-auto mt-6 bg-[#18181B] rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-center">
          {companyName || uiSymbol} – Stock Price Analysis
        </h3>

        {/* Custom legend row */}
        <div className="flex justify-center gap-4 text-xs mb-4 text-gray-300">
          {maOptions.show50 && (
            <span className="flex items-center gap-1">
              <span className="border-b-2 border-dashed border-orange-400 w-4" />
              50-Day MA
            </span>
          )}
          {maOptions.show20 && (
            <span className="flex items-center gap-1">
              <span className="border-b-2 border-dotted border-yellow-400 w-4" />
              20-Day MA
            </span>
          )}
          {maOptions.show10 && (
            <span className="flex items-center gap-1">
              <span className="border-b-2 border-dotted border-yellow-200 w-4" />
              10-Day MA
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="border-b-2 border-[#3b82f6] w-4" />
            Price
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#ef4444]">●</span> Financial Event
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#10b981]">●</span> Dividend
          </span>
        </div>

        {!chartData || chartData.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-sm">
            Not enough data to display chart.
          </div>
        ) : (
          <div style={{ width: "100%", height: 450 }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData}> 
                <CartesianGrid stroke="#2f2f2f" strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#e5e7eb", fontSize: 11 }}
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })
                  }
                  interval="preserveStartEnd"
                  minTickGap={25}
                />

                {/* SINGLE RIGHT Y-AXIS: PRICE */}
                <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#3b82f6", fontSize: 11 }}
                domain={[domainMin, domainMax]}
                ticks={generateScreenerTicks(domainMin, domainMax)}
                tickFormatter={(v) => v.toLocaleString("en-IN")}
                stroke="#3b82f6"
                style={{ transform: 'translate(10px, 0)' }}
                />


                <Tooltip content={<CustomTooltip />} />

                {/* Brush for zoom */}
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#3b82f6"
                  fill="#111827"
                  travellerWidth={10}
                >
                  <AreaChart>
                    <YAxis hide domain={[domainMin, domainMax]} />
                    <Area
                      dataKey="price"
                      stroke="#3b82f6"
                      fill="#3b82f640"
                    />
                  </AreaChart>
                </Brush>

                {/* MA lines */}
                {maOptions.show50 && (
                  <Line
                    type="monotone"
                    dataKey="ma50"
                    stroke="#fb923c"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="10 5"
                    yAxisId="right"
                  />
                )}
                {maOptions.show20 && (
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="#facc15"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    yAxisId="right"
                  />
                )}
                {maOptions.show10 && (
                  <Line
                    type="monotone"
                    dataKey="ma10"
                    stroke="#fef08a"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="2 4"
                    yAxisId="right"
                  />
                )}

                {/* Price line */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  yAxisId="right"
                />

                {/* Event dots */}
                {filteredEvents.map((e) =>
                  e.price != null && !isNaN(e.price) ? (
                    <ReferenceDot
                      key={e.id}
                      x={e.date}
                      y={e.price}
                      r={5}
                      yAxisId="right"
                      fill={actionColors[e.action_type]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ) : null
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* FINANCIAL SUMMARY (my styling) */}
      <div className="max-w-6xl mx-auto mt-8 bg-[#18181B] rounded-xl px-6 py-5 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-200">
          <span className="text-2xl"></span> Financial Summary
        </h3>

        {latestFinancials.date ? (
          <div className="flex gap-20 flex-wrap">
            <div>
              <div className="text-gray-400 mb-2 text-sm">Latest Revenue</div>
              <div className="text-3xl font-bold text-[#10b981]">
                {formatCurrency(latestFinancials.revenue)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Date: {formatDate(latestFinancials.date)}
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-2 text-sm">Latest Profit</div>
              <div className="text-3xl font-bold text-[#f472b6]">
                {formatCurrency(latestFinancials.net_income)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Margin:{" "}
                {latestFinancials.margin != null
                  ? `${latestFinancials.margin.toFixed(2)}%`
                  : "--"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            No recent financial summary available.
          </div>
        )}
      </div>

      {/* EVENT LIST – only dividends */}
      <div className="max-w-6xl mx-auto mt-8">
        <h3 className="text-sm font-semibold mb-2 text-gray-200">
          Dividend History (selected range)
        </h3>

        {filteredEvents.filter((e) => e.action_type === "DIVIDEND").length ===
        0 ? (
          <div className="text-gray-400 text-xs">
            No dividend events in this period.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents
              .filter((e) => e.action_type === "DIVIDEND")
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between bg-[#18181B] px-3 py-2 border border-gray-700 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: actionColors.DIVIDEND }}
                    />
                    <span className="font-medium">Dividend</span>
                    <span className="text-gray-400">
                      Value: {formatPrice(e.details?.value)}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {formatDate(e.date)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;