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
      <div className="backend-status">
        <p className="status-error">Backend: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="backend-status">
        <p className="status-loading">Checking backend…</p>
      </div>
    );
  }

  return (
    <div className="backend-status">
      <p className="status-ok">
        {data.message} (API: {data.timestamp})
      </p>
    </div>
  );
}
