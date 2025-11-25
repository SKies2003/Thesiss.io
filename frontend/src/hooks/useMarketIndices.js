import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "http://127.0.0.1:8000/market-indices";

const hydrateIndex = (detail) => {
  const points = detail.hourly_prices || [];
  
  // Sort points by datetime to ensure correct ordering
  const sortedPoints = [...points].sort((a, b) => 
    new Date(a.datetime) - new Date(b.datetime)
  );
  
  // Get yesterday's closing price (should be at 15:30 of previous day)
  // and today's closing price (should be at 15:30 of today)
  let yesterdayClose = null;
  let todayClose = null;
  
  if (sortedPoints.length >= 2) {
    // Yesterday's close is the first entry (at 15:30 previous day)
    yesterdayClose = sortedPoints[0];
    // Today's close is the last entry (at 15:30 today)
    todayClose = sortedPoints[sortedPoints.length - 1];
  }
  
  const latestPrice = todayClose?.price ?? null;
  const changePercent =
    todayClose && yesterdayClose && yesterdayClose.price !== 0
      ? ((todayClose.price - yesterdayClose.price) / yesterdayClose.price) * 100
      : 0;

  return {
    ...detail,
    latestPrice,
    changePercent,
    sparkline: sortedPoints.map((p) => ({
      date: p.datetime,
      value: Number(p.price),
    })),
  };
};

export const useMarketIndices = () => {
  const { token } = useAuth();
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIndices = useCallback(async () => {
    if (!token) {
      setError("Please login to view market indices.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const listRes = await fetch(`${BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!listRes.ok) throw new Error("Unable to load indices list.");
      const list = await listRes.json();

      const detailed = await Promise.all(
        list.map(async (idx) => {
          const res = await fetch(`${BASE_URL}/${idx.symbol}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return idx;
          const detail = await res.json();
          return hydrateIndex(detail);
        })
      );

      setIndices(detailed);
    } catch (err) {
      console.error(err);
      setError("Unable to load market indices.");
      setIndices([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIndices();
  }, [fetchIndices]);

  return { indices, loading, error, refresh: fetchIndices };
};