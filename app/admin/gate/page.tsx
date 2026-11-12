import type { Metadata } from "next";
import { gateStats } from "@/app/admin/gate/actions";
import { GateScanner } from "@/components/admin/GateScanner";
import { requireGateAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gate | CYE 2026", robots: { index: false, follow: false } };

/** Event-day gate: scan a pass QR code (or look someone up) to check them in. */
export default async function GatePage() {
  const me = await requireGateAccess();
  return <GateScanner name={me.name || me.email} isAdmin={me.role === "admin"} initialStats={await gateStats()} />;
}
