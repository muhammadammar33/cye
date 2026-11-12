import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, MapPin, XCircle } from "lucide-react";
import { checkInPass } from "@/app/admin/actions";
import { PrintButton } from "@/components/PrintButton";
import { EVENT } from "@/data/event";
import { PASS_CATEGORIES, type PassCategory } from "@/lib/passCategories";
import { passByToken } from "@/lib/passes";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event pass | CYE 2026", robots: { index: false, follow: false } };

const PKT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

/** A holder's pass. Scanning the QR code opens this page, so gate staff see at once whether it is valid. */
export default async function PassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pass = await passByToken(token);
  if (!pass) notFound();
  const cat = PASS_CATEGORIES[pass.category as PassCategory] ?? PASS_CATEGORIES.visitor;
  const admin = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  const valid = !pass.revokedAt;

  return (
    <main className="min-h-screen bg-cye-mist px-4 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-sm">
        <div
          className={`rounded-full px-4 py-2 text-center text-sm font-bold print:hidden ${valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}
          role="status"
        >
          {valid ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Valid pass
              {pass.checkedInAt ? ` · checked in ${PKT.format(pass.checkedInAt)}` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <XCircle className="h-4 w-4" aria-hidden /> This pass has been cancelled
            </span>
          )}
        </div>

        <article className={`mt-4 overflow-hidden rounded-3xl border-2 bg-white shadow-card ${valid ? "" : "opacity-60 grayscale"}`} style={{ borderColor: cat.color }}>
          <header className="px-6 py-4 text-white" style={{ background: cat.color }}>
            <p className="text-[11px] font-bold tracking-[0.25em] opacity-85">CAPITAL YOUTH EXPO 2026</p>
            <p className="mt-1 font-heading text-2xl font-extrabold tracking-wide">{cat.label.toUpperCase()}</p>
          </header>
          <div className="flex flex-col items-center px-6 pb-5 pt-6 text-center">
            <Image src="/brand/cye-logo.png" alt="Capital Youth Expo" width={72} height={71} className="h-auto w-16" />
            <h1 className="mt-4 font-heading text-2xl font-extrabold text-cye-ink">{pass.name}</h1>
            {pass.detail ? <p className="mt-1 text-sm text-cye-ink/75">{pass.detail}</p> : null}
            {pass.institution ? <p className="mt-0.5 text-xs text-cye-ink/55">{pass.institution}</p> : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- PNG generated per pass by our own route */}
            <img src={`/api/passes/${pass.token}/qr`} alt={`QR code for pass ${pass.code}`} width={200} height={200} className="mt-5 h-[200px] w-[200px]" />
            <p className="mt-2 font-mono text-lg font-bold tracking-widest" style={{ color: cat.color }}>
              {pass.code}
            </p>
          </div>
          <footer className="space-y-1.5 border-t border-dashed border-slate-300 px-6 py-4 text-sm text-cye-ink/75">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" style={{ color: cat.color }} aria-hidden />
              {EVENT.date}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: cat.color }} aria-hidden />
              {EVENT.venue}, {EVENT.city}
            </p>
          </footer>
        </article>

        <p className="mt-4 text-center text-xs text-cye-ink/60">Personal pass. Bring your CNIC, student card or B-Form.</p>

        <div className="mt-4 flex flex-col items-center gap-3 print:hidden">
          <PrintButton className="inline-flex items-center gap-2 rounded-full border border-cye-blue/20 bg-white px-5 py-2.5 text-sm font-semibold text-cye-blue hover:border-cye-orange hover:text-cye-orange" />
          {admin && valid && !pass.checkedInAt ? (
            <form action={checkInPass.bind(null, pass.token)}>
              <button type="submit" className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                Check in {pass.name.split(" ")[0]}
              </button>
            </form>
          ) : null}
          {admin ? <p className="text-xs text-cye-ink/50">Signed in as admin ({admin.name}). Holder email: {pass.email}</p> : null}
        </div>
      </div>
    </main>
  );
}
