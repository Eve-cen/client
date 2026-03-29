import { useState, useCallback } from "react";
import { apiFetch } from "../utils/api";

export function useSearch() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
      ).toString();
      const data = await apiFetch({ endpoint: `/search?${qs}`, cacheable: true });
      setResults(data.properties || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, total, pages, loading, error, search };
}
