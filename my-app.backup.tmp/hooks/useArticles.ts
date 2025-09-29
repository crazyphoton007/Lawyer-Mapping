import { useEffect, useState } from "react";
import { API_BASE } from "../constants/config";

export type Article = {
  id: string; title: string;
  year?: number | null; court?: string | null;
  summary?: string | null; tags?: string[] | null;
};

export function useArticles() {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(null);

      // FORCE absolute URL (never becomes localhost:8082)
      const url = new URL("/articles/", API_BASE.replace(/\/$/, "")).toString();
      console.log("[useArticles] URL =", url);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 120)}`);
        }
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const body = await res.text();
          throw new Error(`Unexpected content-type: ${ct}. Starts: ${body.slice(0, 60)}`);
        }
        const json = (await res.json()) as Article[];
        if (alive) setData(Array.isArray(json) ? json : []);
      } catch (e:any) {
        if (alive) setError(e.message ?? "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { data, loading, error };
}
// ddvdv