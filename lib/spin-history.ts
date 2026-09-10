// Local (per-browser) log of finished spins. Used to tell the user when the
// dish they just rolled was picked before. Nothing leaves the device.
export type SpinRecord = { name: string; mode: string; at: number };

const KEY = 'truanayangi-spin-history';
const CAP = 400;

export function readSpinHistory(): SpinRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (r): r is SpinRecord =>
        !!r && typeof r.name === 'string' && typeof r.mode === 'string' && typeof r.at === 'number' && Number.isFinite(r.at),
    );
  } catch {
    return [];
  }
}

export function appendSpin(rec: SpinRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...readSpinHistory(), rec].slice(-CAP)));
  } catch {
    /* private mode / quota — the history is a nice-to-have, not critical */
  }
}

const dayFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Distinct calendar days (oldest → newest) a dish was picked on, from history.
export function pickedDays(history: SpinRecord[], name: string): string[] {
  const days: string[] = [];
  for (const r of history) {
    if (r.name !== name) continue;
    const d = dayFmt.format(new Date(r.at));
    if (days[days.length - 1] !== d && !days.includes(d)) days.push(d);
  }
  return days;
}
