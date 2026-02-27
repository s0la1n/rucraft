"use client";

import { useEffect, useState } from "react";
import { ping, type PingResponse } from "@/lib/api";

export function BackendStatus() {
  const [data, setData] = useState<PingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ping()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Connection failed"));
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
        Backend: {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">Checking backend…</p>
    );
  }

  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
      {data.message} (API: {data.timestamp})
    </p>
  );
}
