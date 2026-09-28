"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Load a list without treating a failed request as an empty result. */
export function useAsyncList<T extends { error?: string }>(
  fetcher: () => Promise<T[]>,
  enabled = true,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [failed, setFailed] = useState(false);
  const request = useRef(0);
  const reload = useCallback(async () => {
    if (!enabled) return;
    const id = ++request.current;
    setLoading(true);
    setFailed(false);
    try {
      const result = await fetcher();
      if (result.some((item) => item.error))
        throw new Error("List request failed");
      if (id === request.current) setData(result);
    } catch {
      if (id === request.current) setFailed(true);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [fetcher, enabled]);
  const invalidate = useCallback(() => {
    request.current++;
  }, []);
  useEffect(() => {
    if (enabled) void reload();
    return invalidate;
  }, [enabled, reload, invalidate]);
  return { data, setData, loading, failed, reload };
}
