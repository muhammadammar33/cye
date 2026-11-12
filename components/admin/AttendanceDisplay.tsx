"use client";

import { Expand } from "lucide-react";
import { useEffect, useState } from "react";
import { gateStats, type GateStats } from "@/app/admin/gate/actions";
import { DISPLAY_ORDER, PASS_CATEGORIES } from "@/lib/passCategories";
import { cn } from "@/lib/cn";

const CLOCK = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
const REFRESH_MS = 15_000;

/**
 * Live event-day attendance: people in (pass holders checked in plus the team members who came with project and
 * startup leads), then one labelled progress row per pass type. "screen" fills a TV or projector; "card" sits on
 * the admin overview. Refreshes every 15 seconds.
 */
export function AttendanceDisplay({ initial, variant }: { initial: GateStats; variant: "screen" | "card" }) {
  const [stats, setStats] = useState(initial);
  const [updated, setUpdated] = useState(() => new Date());
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      gateStats()
        .then((s) => (setStats(s), setUpdated(new Date()), setStale(false)))
        .catch(() => setStale(true));
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const peopleIn = stats.checkedIn + stats.companions;
  const pct = stats.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0;
  const byCat = new Map(stats.byCategory.map((c) => [c.category, c]));
  const rows = DISPLAY_ORDER.map((key) => ({ key, ...PASS_CATEGORIES[key], ...(byCat.get(key) ?? { total: 0, checkedIn: 0 }) })).filter((r) => r.total > 0);
  const big = variant === "screen";

  return (
    <section aria-label="Event attendance" className={cn(big ? "flex min-h-dvh flex-col bg-white px-6 py-8 text-cye-ink sm:px-12 sm:py-10" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("font-bold uppercase tracking-[0.2em] text-cye-orange", big ? "text-sm sm:text-base" : "text-xs")}>Capital Youth Expo 2026 · Live</p>
          <h2 className={cn("font-heading font-black text-cye-blue", big ? "mt-1 text-2xl sm:text-3xl" : "mt-0.5 text-lg")}>People in</h2>
        </div>
        <div className="flex items-center gap-3 text-right">
          <p className={cn("text-slate-500", big ? "text-sm" : "text-xs")}>
            {stale ? <span className="font-semibold text-amber-700">Reconnecting...</span> : <>Updated {CLOCK.format(updated)}</>}
          </p>
          {big ? (
            <button
              type="button"
              onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 print:hidden"
            >
              <Expand className="h-3.5 w-3.5" aria-hidden /> Full screen
            </button>
          ) : (
            <a href="/admin/attendance" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Expand className="h-3.5 w-3.5" aria-hidden /> Big screen
            </a>
          )}
        </div>
      </div>

      {/* Hero number: the one figure people look for. */}
      <div className={cn("flex flex-wrap items-end gap-x-6 gap-y-2", big ? "mt-6" : "mt-3")}>
        <p className={cn("font-heading font-black leading-none tabular-nums text-cye-ink", big ? "text-[clamp(5rem,16vw,12rem)]" : "text-5xl")}>{peopleIn.toLocaleString()}</p>
        <div className={cn("pb-2 text-slate-600", big ? "text-lg sm:text-xl" : "text-sm")}>
          <p>
            <strong className="text-cye-ink">{stats.checkedIn.toLocaleString()}</strong> of {stats.total.toLocaleString()} pass holders ({pct}%)
          </p>
          {stats.companions ? (
            <p>
              + <strong className="text-cye-ink">{stats.companions.toLocaleString()}</strong> team member{stats.companions === 1 ? "" : "s"} with project and startup leads
            </p>
          ) : null}
          <p>
            <strong className="text-cye-ink">{stats.recent.toLocaleString()}</strong> arrived in the last 15 minutes
            {stats.lastAt ? <> · last at {CLOCK.format(new Date(stats.lastAt))}</> : null}
          </p>
        </div>
      </div>

      {/* One labelled row per pass type: name and numbers in text, a coloured dot and bar beside them. */}
      {rows.length ? (
        <ul className={cn("grid", big ? "mt-10 gap-x-12 gap-y-5 lg:grid-cols-2" : "mt-5 gap-3 sm:grid-cols-2")}>
          {rows.map((r) => {
            const share = r.total ? (r.checkedIn / r.total) * 100 : 0;
            return (
              <li key={r.key}>
                <div className={cn("flex items-baseline justify-between gap-3", big ? "text-lg sm:text-xl" : "text-sm")}>
                  <span className="inline-flex items-center gap-2 font-semibold text-cye-ink">
                    <span className={cn("shrink-0 rounded-full", big ? "h-3.5 w-3.5" : "h-2.5 w-2.5")} style={{ background: r.color }} aria-hidden />
                    {r.label}
                  </span>
                  <span className="tabular-nums text-slate-600">
                    <strong className="text-cye-ink">{r.checkedIn.toLocaleString()}</strong> / {r.total.toLocaleString()}
                  </span>
                </div>
                <div className={cn("mt-1.5 overflow-hidden rounded-full bg-slate-100", big ? "h-3" : "h-2")} role="img" aria-label={`${r.label}: ${r.checkedIn} of ${r.total} checked in`}>
                  <div className="h-full rounded-full" style={{ width: `${share}%`, minWidth: r.checkedIn ? 4 : 0, background: r.color }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={cn("text-slate-500", big ? "mt-10 text-lg" : "mt-4 text-sm")}>No passes issued yet.</p>
      )}
    </section>
  );
}
