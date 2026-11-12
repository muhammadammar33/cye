"use client";

import { Camera, CameraOff, LayoutDashboard, LogOut, Minus, Monitor, Plus, Search, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { logout } from "@/app/admin/actions";
import { gateCheckIn, gateSearch, gateSetCompanions, gateStats, gateUndo, type GatePass, type GateResult, type GateStats } from "@/app/admin/gate/actions";
import { PASS_CATEGORIES, type PassCategory } from "@/lib/passCategories";

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", timeZone: "Asia/Karachi" });
const catOf = (c: string) => PASS_CATEGORIES[c as PassCategory] ?? { label: c, color: "#334155" };

/** Pass token from a scanned QR code: the pass link (…/pass/<token>) or the bare token. */
function tokenFrom(text: string) {
  return text.match(/\/pass\/([0-9a-f]{32})(?:[/?#]|$)/i)?.[1]?.toLowerCase() ?? (/^[0-9a-f]{32}$/i.test(text.trim()) ? text.trim().toLowerCase() : null);
}

/** Short beep and buzz so staff know the result without looking (high = in, low = problem). */
function signal(ok: boolean) {
  try {
    navigator.vibrate?.(ok ? 120 : [200, 100, 200]);
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.frequency.value = ok ? 880 : 220;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.15 : 0.4));
    osc.onended = () => ctx.close();
  } catch {
    /* sound and vibration are optional */
  }
}

type Shown = GateResult | { result: "not_cye" };

export function GateScanner({ name, isAdmin, initialStats }: { name: string; isAdmin: boolean; initialStats: GateStats }) {
  const [stats, setStats] = useState(initialStats);
  const [shown, setShown] = useState<Shown | null>(null);
  const [camera, setCamera] = useState<"off" | "starting" | "on" | "error">("off");
  const [cameraError, setCameraError] = useState("");
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<GatePass[] | null>(null);
  const [pending, startTransition] = useTransition();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const busy = useRef(false);
  const recent = useRef<{ token: string; at: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshStats = useCallback(() => gateStats().then(setStats).catch(() => {}), []);
  useEffect(() => {
    const id = setInterval(refreshStats, 30_000);
    return () => clearInterval(id);
  }, [refreshStats]);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setShown(null);
    busy.current = false;
  }, []);

  const show = useCallback(
    (r: Shown) => {
      setShown(r);
      signal(r.result === "checked_in");
      if (timer.current) clearTimeout(timer.current);
      // A good scan clears itself; a problem stays until staff tap it, so it isn't missed.
      if (r.result === "checked_in" && !r.pass?.askTeam) timer.current = setTimeout(dismiss, 3500);
    },
    [dismiss],
  );

  const checkIn = useCallback(
    async (input: { token?: string; id?: number }) => {
      busy.current = true;
      try {
        const r = await gateCheckIn(input);
        show(r);
        if (r.result === "checked_in") refreshStats();
        if (input.id) setFound((list) => list?.map((p) => (p.id === r.pass?.id ? r.pass! : p)) ?? null);
      } catch {
        show({ result: "not_found" });
      }
    },
    [refreshStats, show],
  );

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera("off");
  }, []);

  const startCamera = useCallback(async () => {
    setCamera("starting");
    setCameraError("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false });
      if (video.current) {
        video.current.srcObject = stream.current;
        await video.current.play();
      }
      setCamera("on");
    } catch (err) {
      setCamera("error");
      setCameraError(err instanceof Error && err.name === "NotAllowedError" ? "Camera permission was refused. Allow the camera for this site in the browser settings, then try again." : "Could not open the camera on this device. Use the search below.");
    }
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  // Decode frames while the camera is on. jsQR runs in the page, so it works on iPhone and Android alike.
  useEffect(() => {
    if (camera !== "on") return;
    let stopped = false;
    let last = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let decode: typeof import("jsqr").default | null = null;
    import("jsqr").then((m) => (decode = m.default));
    const tick = (now: number) => {
      if (stopped) return;
      const v = video.current;
      if (decode && ctx && v && v.readyState >= 2 && !busy.current && now - last > 150) {
        last = now;
        const scale = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
        canvas.width = Math.round(v.videoWidth * scale);
        canvas.height = Math.round(v.videoHeight * scale);
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const code = decode(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
        if (code?.data) {
          const token = tokenFrom(code.data);
          const r = recent.current;
          if (!token) {
            busy.current = true;
            show({ result: "not_cye" });
          } else if (!r || r.token !== token || now - r.at > 5000) {
            recent.current = { token, at: now };
            void checkIn({ token });
          }
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      stopped = true;
    };
  }, [camera, checkIn, show]);

  const pct = stats.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <main className="min-h-dvh bg-slate-950 text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="font-heading text-sm font-black uppercase tracking-wide">CYE Gate</p>
          <p className="truncate text-xs text-white/60">{name}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/attendance" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
            <Monitor className="h-3.5 w-3.5" aria-hidden /> Big screen
          </a>
          {isAdmin ? (
            <a href="/admin/passes" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden /> Dashboard
            </a>
          ) : null}
          <form action={logout}>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
        <section aria-label="Attendance" className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-end justify-between">
            <p className="text-sm text-white/70">Checked in</p>
            <p className="font-heading text-2xl font-black">
              {stats.checkedIn.toLocaleString()} <span className="text-base font-semibold text-white/50">/ {stats.total.toLocaleString()}</span>
            </p>
          </div>
          {stats.companions ? (
            <p className="mt-1 text-right text-xs text-white/60">
              + {stats.companions.toLocaleString()} team member{stats.companions === 1 ? "" : "s"} with project and startup leads ={" "}
              <span className="font-bold text-white">{(stats.checkedIn + stats.companions).toLocaleString()} people in</span>
            </p>
          ) : null}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            {stats.byCategory.map((c) => (
              <li key={c.category} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full" style={{ background: catOf(c.category).color }} aria-hidden />
                {catOf(c.category).label} {c.checkedIn}/{c.total}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Scanner" className="overflow-hidden rounded-2xl bg-black">
          <div className="relative aspect-square w-full">
            <video ref={video} playsInline muted className={`h-full w-full object-cover ${camera === "on" ? "" : "hidden"}`} />
            {camera === "on" ? (
              <div className="pointer-events-none absolute inset-[18%] rounded-3xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" aria-hidden />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Camera className="h-10 w-10 text-white/40" aria-hidden />
                {cameraError ? <p className="text-sm text-amber-300">{cameraError}</p> : <p className="text-sm text-white/60">Point the camera at the QR code on the pass.</p>}
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={camera === "starting"}
                  className="rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {camera === "starting" ? "Opening camera..." : "Start scanning"}
                </button>
              </div>
            )}
          </div>
          {camera === "on" ? (
            <button type="button" onClick={stopCamera} className="flex w-full items-center justify-center gap-2 bg-white/5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10">
              <CameraOff className="h-4 w-4" aria-hidden /> Stop camera
            </button>
          ) : null}
        </section>

        <section aria-label="Look up a pass" className="rounded-2xl bg-white/5 p-4">
          <h2 className="text-sm font-bold">No QR code?</h2>
          <p className="mt-0.5 text-xs text-white/60">Search by pass number, name, email or phone.</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => setFound(await gateSearch(query)));
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. CYE-V-00042 or Ali Khan"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-400"
              aria-label="Search passes"
            />
            <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 disabled:opacity-60">
              <Search className="h-4 w-4" aria-hidden /> Find
            </button>
          </form>
          {found ? (
            found.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No pass found.</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10">
                {found.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="flex items-center gap-1.5 truncate text-xs text-white/60">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: catOf(p.category).color }} aria-hidden />
                        {catOf(p.category).label} · {p.code}
                        {p.detail ? ` · ${p.detail}` : ""}
                      </p>
                    </div>
                    {p.cancelled ? (
                      <span className="shrink-0 text-xs font-bold text-red-400">Cancelled</span>
                    ) : p.checkedInAt ? (
                      <span className="shrink-0 text-xs font-bold text-amber-300">
                        In {TIME.format(new Date(p.checkedInAt))}
                        {p.companions ? ` +${p.companions}` : ""}
                      </span>
                    ) : (
                      <button type="button" onClick={() => checkIn({ id: p.id })} className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400">
                        Check in
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </section>
      </div>

      {shown ? (
        <ResultScreen
          shown={shown}
          onDone={dismiss}
          onUndo={(id) => gateUndo(id).then((s) => (setStats(s), dismiss()))}
          onTeam={(id, n) => gateSetCompanions(id, n).then((s) => (setStats(s), dismiss()))}
        />
      ) : null}
    </main>
  );
}

/**
 * Full-screen result, readable from arm's length: always green when admitted (the pass colour shows as a band on
 * the card, so a red-orange Visitor pass never looks like an error), amber when already used, red when invalid.
 */
function ResultScreen({ shown, onDone, onUndo, onTeam }: { shown: Shown; onDone: () => void; onUndo: (id: number) => void; onTeam: (id: number, people: number) => void }) {
  const pass = "pass" in shown ? shown.pass : undefined;
  const askTeam = shown.result === "checked_in" && pass?.askTeam;
  const cat = pass ? catOf(pass.category) : null;
  const look = {
    checked_in: { bg: "#15803d", title: "Checked in", note: "Check their CNIC, student card or B-Form." },
    already: {
      bg: "#b45309",
      title: "Already checked in",
      note: pass?.checkedInAt
        ? `This pass was used at ${TIME.format(new Date(pass.checkedInAt))}${pass.companions ? ` with ${pass.companions} team member${pass.companions === 1 ? "" : "s"}` : ""}. Do not admit again without checking with the gate lead.`
        : "",
    },
    cancelled: { bg: "#b91c1c", title: "Pass cancelled", note: "This pass is no longer valid. Send the person to the help desk." },
    not_found: { bg: "#b91c1c", title: "Not a valid pass", note: "This QR code doesn't match any CYE pass. Try searching by name." },
    not_cye: { bg: "#b91c1c", title: "Not a CYE pass", note: "This QR code isn't a Capital Youth Expo pass." },
  }[shown.result];
  return (
    <div role="alertdialog" aria-live="assertive" aria-label={look.title} className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto p-6 text-center text-white" style={{ background: look.bg }} onClick={askTeam ? undefined : onDone}>
      <p className="font-heading text-4xl font-black uppercase leading-tight">{look.title}</p>
      {pass ? (
        <div className="mt-6 w-full max-w-sm overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
          <p className="px-5 py-3 text-lg font-black uppercase tracking-[0.15em] text-white" style={{ background: cat?.color }}>
            {cat?.label}
          </p>
          <div className="p-5">
            <p className="text-3xl font-black">{pass.name}</p>
            {pass.detail ? <p className="mt-1 text-base text-slate-700">{pass.detail}</p> : null}
            {pass.institution ? <p className="text-sm text-slate-500">{pass.institution}</p> : null}
            <p className="mt-3 font-mono text-lg font-bold tracking-widest" style={{ color: cat?.color }}>
              {pass.code}
            </p>
          </div>
        </div>
      ) : null}
      <p className="mt-6 max-w-sm text-base font-semibold text-white/90">{look.note}</p>
      {askTeam && pass ? (
        <TeamCount pass={pass} onSave={(n) => onTeam(pass.id, n)} onUndo={() => onUndo(pass.id)} />
      ) : (
      <div className="mt-8 flex gap-3">
        {shown.result === "checked_in" && pass ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUndo(pass.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/60 px-5 py-2.5 text-sm font-bold"
          >
            <Undo2 className="h-4 w-4" aria-hidden /> Undo
          </button>
        ) : null}
        <button type="button" onClick={onDone} className="rounded-full bg-white px-7 py-2.5 text-sm font-black text-slate-900">
          Next
        </button>
      </div>
      )}
    </div>
  );
}

/** Project and startup leads: ask how many team members came with them, then save. */
function TeamCount({ pass, onSave, onUndo }: { pass: GatePass; onSave: (people: number) => void; onUndo: () => void }) {
  const [n, setN] = useState(0);
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    onSave(n);
  };
  return (
    <div className="mt-6 w-full max-w-sm rounded-3xl bg-black/20 p-5">
      <p className="text-lg font-black">How many team members are with them?</p>
      <p className="mt-1 text-sm text-white/80">
        Not counting {pass.name.split(" ")[0]}.{pass.registeredTeam ? ` Registered team: ${pass.registeredTeam} people, so up to ${Math.max(0, pass.registeredTeam - 1)} more.` : ""}
      </p>
      <div className="mt-4 flex items-center justify-center gap-5">
        <button type="button" aria-label="One fewer" onClick={() => setN((v) => Math.max(0, v - 1))} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
          <Minus className="h-6 w-6" aria-hidden />
        </button>
        <output aria-live="polite" className="w-16 font-heading text-5xl font-black tabular-nums">
          {n}
        </output>
        <button type="button" aria-label="One more" onClick={() => setN((v) => Math.min(100, v + 1))} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
          <Plus className="h-6 w-6" aria-hidden />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setN(v)}
            className={`h-10 w-10 rounded-full text-sm font-bold ${n === v ? "bg-white text-slate-900" : "bg-white/15 hover:bg-white/25"}`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={onUndo} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full border border-white/60 px-5 py-2.5 text-sm font-bold disabled:opacity-60">
          <Undo2 className="h-4 w-4" aria-hidden /> Undo
        </button>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-white px-6 py-2.5 text-sm font-black text-slate-900 disabled:opacity-60">
          {saving ? "Saving..." : `Save ${n + 1} ${n === 0 ? "person" : "people"} & next`}
        </button>
      </div>
    </div>
  );
}
