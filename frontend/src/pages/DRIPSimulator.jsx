import React, { useState, useRef } from "react";
import CompanySelector from "../components/CompanySelector";
import { useAuth } from "../contexts/AuthContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const DRIPSimulator = () => {
  const { token } = useAuth();

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [investment, setInvestment] = useState("100000");
  const [years, setYears] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "₹0";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value == null || isNaN(value)) return "--";
    return value.toLocaleString("en-IN", { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const handleSimulate = async () => {
    setError("");
    setResult(null);

    if (!selectedCompany) {
      setError("Please select a company first.");
      return;
    }

    const investmentAmount = parseFloat(investment);
    const yearsDuration = parseInt(years);

    if (!investmentAmount || investmentAmount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    if (!yearsDuration || yearsDuration <= 0 || yearsDuration > 20) {
      setError("Please enter years between 1 and 20.");
      return;
    }

    setLoading(true);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - yearsDuration);

      const params = new URLSearchParams({
        symbol: selectedCompany.symbol,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        initial_investment: investmentAmount
      });

      const response = await fetch(
        `http://localhost:8000/companies/drip-simulation?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch simulation data");
      }

      const data = await response.json();
      setResult(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{data.date}</p>
          <p className="text-green-400 text-sm">
            With DRIP: {formatCurrency(data.with_drip)}
          </p>
          <p className="text-blue-400 text-sm">
            Without DRIP: {formatCurrency(data.without_drip)}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Shares: {formatNumber(data.shares_owned, 4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e14] via-[#0f1419] to-[#0a0e14] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Dividend Reinvestment Planner
          </h1>
          <p className="text-blue-400 text-lg font-medium mb-2">
            Discover the magic of Dividend Reinvestment
          </p>
          <p className="text-gray-400 text-sm">
            See how reinvesting dividends compounds your wealth over time
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Company Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Company
              </label>
              <CompanySelector
                selectedCompany={selectedCompany}
                onSelectCompany={setSelectedCompany}
              />
            </div>

            {/* Investment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Investment (₹)
              </label>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                step="500"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100000"
              />
            </div>

            {/* Years */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Period (Years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="5"
                min="1"
                max="20"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="mt-6 w-full py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 shadow-lg hover:shadow-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Simulating..." : "Run Simulation"}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div ref={resultsRef} className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Without DRIP */}
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-blue-400 text-sm font-medium mb-2">
                  Without DRIP
                </h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(result.final_value_without_drip)}
                </p>
                <p className="text-green-400 text-lg">
                  +{result.gain_without_drip_percent}%
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Cash Dividends: {formatCurrency(result.total_dividends_received)}
                </p>
              </div>

              {/* With DRIP */}
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-green-400 text-sm font-medium mb-2">
                  With DRIP
                </h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(result.final_value_with_drip)}
                </p>
                <p className="text-green-400 text-lg">
                  +{result.gain_with_drip_percent}%
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Reinvested: {formatCurrency(result.total_dividends_reinvested)}
                </p>
              </div>

              {/* DRIP Advantage */}
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-purple-400 text-sm font-medium mb-2">
                  DRIP Advantage
                </h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(result.extra_wealth_from_drip)}
                </p>
                <p className="text-yellow-400 text-lg">
                  +{result.drip_advantage_percent}% Extra
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Bonus wealth from compounding
                </p>
              </div>
            </div>

            {/* Share Details */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-green-400">
                Share Accumulation
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Without DRIP</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(result.total_shares_without_drip, 4)}
                  </p>
                  <p className="text-xs text-gray-500">shares</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">With DRIP</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatNumber(result.total_shares_with_drip, 4)}
                  </p>
                  <p className="text-xs text-gray-500">shares</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">From Dividends</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatNumber(result.shares_from_dividends, 4)}
                  </p>
                  <p className="text-xs text-gray-500">extra shares</p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 text-center text-green-400">
                Wealth Growth Comparison
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={result.timeline}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorWithDRIP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithoutDRIP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Area
                    type="monotone"
                    dataKey="with_drip"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorWithDRIP)"
                    name="With DRIP"
                  />
                  <Area
                    type="monotone"
                    dataKey="without_drip"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorWithoutDRIP)"
                    name="Without DRIP"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-green-400">
                How DRIP Creates Extra Wealth
              </h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    <strong>Compound Effect:</strong> Dividends buy more shares, which generate more dividends in the future
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    <strong>Capital Appreciation:</strong> All shares (including dividend-bought ones) benefit from price increases
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    <strong>Exponential Growth:</strong> More shares → More dividends → Even more shares
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DRIPSimulator;
