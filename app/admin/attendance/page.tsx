import type { Metadata } from "next";
import { gateStats } from "@/app/admin/gate/actions";
import { AttendanceDisplay } from "@/components/admin/AttendanceDisplay";
import { requireGateAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Live attendance | CYE 2026", robots: { index: false, follow: false } };

/** Big-screen attendance for a TV or projector at the venue. Admins and gate staff can open it. */
export default async function AttendancePage() {
  await requireGateAccess();
  return <AttendanceDisplay initial={await gateStats()} variant="screen" />;
}
