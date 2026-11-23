import "server-only";
import { and, count, eq, notInArray } from "drizzle-orm";
import { db, schema as s } from "@/lib/db";

/** Talent Tribute closes by itself once this many applications are in (rejected and archived ones don't count). */
export const TALENT_TRIBUTE_CAPACITY = 300;

/** Talent Tribute applications holding a place: all except rejected and archived ones. */
export async function talentTaken() {
  if (!db) return 0;
  const [{ n }] = await db
    .select({ n: count() })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, "talent"), notInArray(s.submissions.status, ["rejected", "archived"])));
  return n;
}

/** Whether Talent Tribute has reached its limit. */
export async function talentFull() {
  return (await talentTaken()) >= TALENT_TRIBUTE_CAPACITY;
}
