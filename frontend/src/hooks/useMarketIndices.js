import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "http://127.0.0.1:8000/market-indices";

const hydrateIndex = (detail) => {
  const points = detail.hourly_prices || [];
  const latest = points.at(-1);
  const prev = points.at(-2);

  const latestPrice = latest?.price ?? null;
  const changePercent =
    latest && prev && prev.price !== 0
      ? ((latest.price - prev.price) / prev.price) * 100
      : 0;

  return {
    ...detail,
    latestPrice,
    changePercent,
    sparkline: points.map((p) => ({
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