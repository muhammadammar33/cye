import "server-only";
import { and, count, eq, notInArray } from "drizzle-orm";
import { LAWYERS_CONFERENCE } from "@/data/event";
import { db, schema as s } from "@/lib/db";

/** Lawyers Conference registrations holding a seat: all except rejected and archived ones. */
export async function lawyersSeatsTaken() {
  if (!db) return 0;
  const [{ n }] = await db
    .select({ n: count() })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, "lawyers"), notInArray(s.submissions.status, ["rejected", "archived"])));
  return n;
}

/** Seats still open (never below zero). */
export async function lawyersSeatsLeft() {
  return Math.max(0, LAWYERS_CONFERENCE.capacity - (await lawyersSeatsTaken()));
}
