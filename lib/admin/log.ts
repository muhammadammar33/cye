import "server-only";
import { headers } from "next/headers";
import { db, schema as s } from "@/lib/db";

type Actor = { id: number | null; name: string; email: string };

/** Record an admin action. Never throws: a logging failure must not undo or block the action itself. */
export async function logActivity(actor: Actor, action: string, target?: string | null, details?: string | null) {
  if (!db) return;
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await db.insert(s.adminLogs).values({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action,
      target: target?.slice(0, 300) || null,
      details: details?.slice(0, 2000) || null,
      ip,
    });
  } catch (err) {
    console.error("[admin-log] could not record activity", err);
  }
}
