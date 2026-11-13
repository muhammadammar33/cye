import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { checkInPass } from "@/app/admin/actions";
import { PassCard } from "@/components/PassCard";
import { PrintButton } from "@/components/PrintButton";
import { passByToken } from "@/lib/passes";
import { currentAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Event pass | CYE 2026", robots: { index: false, follow: false } };

const PKT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

/** A holder's pass. Scanning the QR code opens this page, so gate staff see at once whether it is valid. */
export default async function PassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pass = await passByToken(token);
  if (!pass) notFound();
  const admin = await currentAccount();
  const valid = !pass.revokedAt;

  return (
    <main className="min-h-screen bg-cye-mist px-4 py-8 print:min-h-0 print:bg-white print:py-0">
      <div className="mx-auto max-w-[380px]">
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

        <div className="mt-4">
          <PassCard pass={pass} valid={valid} />
        </div>

        <p className="mt-3 text-center text-xs text-cye-ink/60 print:hidden">Personal pass. It can&apos;t be shared.</p>

        <div className="mt-4 flex flex-col items-center gap-3 print:hidden">
          <PrintButton className="inline-flex items-center gap-2 rounded-full border border-cye-blue/20 bg-white px-5 py-2.5 text-sm font-semibold text-cye-blue hover:border-cye-orange hover:text-cye-orange" />
          {admin && valid && !pass.checkedInAt ? (
            <form action={checkInPass.bind(null, pass.token)}>
              <button type="submit" className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                Check in {pass.name.split(" ")[0]}
              </button>
            </form>
          ) : null}
          {admin ? <p className="text-xs text-cye-ink/50">Signed in as {admin.name} ({admin.role === "gate" ? "gate staff" : "admin"}). Holder email: {pass.email}</p> : null}
        </div>
      </div>
    </main>
  );
}
