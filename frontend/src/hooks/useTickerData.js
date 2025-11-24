import { useCallback, useEffect, useState } from "react";

const TICKER_URL = "http://127.0.0.1:8000/companies/ticker";

const normalizeItem = (item) => ({
  ...item,
  symbol: item.symbol?.toUpperCase?.() ?? "",
  value: item.current_price ?? 0,
  changePercent: Number(item.change_percent ?? 0),
  isProfit: Boolean(item.is_profit),
});

export const useTickerData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicker = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(TICKER_URL);
      if (!res.ok) throw new Error("Ticker request failed");
      const json = await res.json();
      setData(Array.isArray(json) ? json.map(normalizeItem) : []);
    } catch (err) {
      setError("Live data unavailable");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 60_000);
    return () => clearInterval(interval);
  }, [fetchTicker]);

  return { data, loading, error, refresh: fetchTicker };
};