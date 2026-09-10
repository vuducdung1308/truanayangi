'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Shared spin counter via Abacus (abacus.jasoncameron.dev): a keyless, no-account
// hit counter with `Access-Control-Allow-Origin: *`.
//   GET /get/<ns>/<key>  -> { value }   read only
//   GET /hit/<ns>/<key>  -> { value }   increment, then read
// public-config.json holds the /get URL; the /hit URL is the same with the verb
// swapped. It is an anonymous gag counter, not fraud-proof analytics: anyone who
// knows the URL can bump it, and past totals from other backends are not carried
// over. An empty apiUrl hides the counter.
const readUrl = process.env.NEXT_PUBLIC_COUNTER_API_URL || '';
const hitUrl = readUrl.replace('/get/', '/hit/');

export function useGlobalSpinCount() {
  const [count, setCount] = useState<number | null>(null);
  const alive = useRef(true);
  const lastRefresh = useRef(0);
  const accept = useCallback((data: { value?: unknown }) => {
    if (alive.current && typeof data.value === 'number' && Number.isSafeInteger(data.value) && data.value >= 0) {
      const value = data.value;
      setCount(previous => Math.max(previous ?? 0, value));
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    if (!readUrl) return () => { alive.current = false; };
    const refresh = async () => {
      if (document.hidden || Date.now() - lastRefresh.current < 60_000) return;
      lastRefresh.current = Date.now();
      try {
        const response = await fetch(readUrl, { signal: AbortSignal.timeout(4000) });
        if (response.ok) accept(await response.json());
      } catch { /* A counter outage must not interrupt opening a case. */ }
    };
    void refresh();
    const interval = setInterval(() => void refresh(), 300_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { alive.current = false; clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
  }, [accept]);

  const recordSpin = useCallback(async (_id: string) => {
    if (!hitUrl) return;
    try {
      const response = await fetch(hitUrl, { keepalive: true, signal: AbortSignal.timeout(4000) });
      if (response.ok) accept(await response.json());
    } catch { /* A counter outage must not interrupt opening a case. */ }
  }, [accept]);
  return { count, enabled: Boolean(readUrl), recordSpin };
}
