import { desc } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { parseFilters, whereFor } from "@/lib/admin/submissionQuery";
import { requireDb, schema as s } from "@/lib/db";

const cell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  await requireAdmin();
  const filters = parseFilters(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await requireDb().select().from(s.submissions).where(whereFor(filters)).orderBy(desc(s.submissions.createdAt));

  const dataKeys = [...new Set(rows.flatMap((row) => Object.keys(row.data)))].filter((k) => k !== "members");
  const hasMembers = rows.some((row) => Array.isArray(row.data.members));
  const header = ["id", "received", "form", "status", "name", "email", "phone", "institution", "about", ...dataKeys, ...(hasMembers ? ["members"] : []), "notes"];
  const lines = rows.map((row) => {
    const members = Array.isArray(row.data.members)
      ? (row.data.members as Record<string, string>[]).map((m) => `${m.name} <${m.email}> ${m.phone} (${m.institution})`).join("; ")
      : "";
    return [
      row.id, row.createdAt.toISOString(), row.type, row.status, row.name, row.email, row.phone, row.institution, row.subject,
      ...dataKeys.map((k) => row.data[k]),
      ...(hasMembers ? [members] : []),
      row.notes,
    ].map(cell).join(",");
  });

  const name = `cye-submissions${filters.type ? `-${filters.type}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(`﻿${[header.map(cell).join(","), ...lines].join("\r\n")}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
  });
}
