import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ENTITIES, ENTITY_KEYS } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/auth";
import { requireDb, schema as s } from "@/lib/db";

export const metadata: Metadata = { title: "Admin | CYE 2026", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const [{ n }] = await requireDb().select({ n: count() }).from(s.submissions).where(eq(s.submissions.status, "new"));
  const nav = <AdminNav content={ENTITY_KEYS.map((key) => ({ key, label: ENTITIES[key].label }))} name={admin.name || admin.email} newCount={n} />;

  return (
    <div className="min-h-dvh bg-slate-100 lg:flex">
      <aside className="bg-grad-blue px-4 py-5 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center gap-2.5 px-2">
          <Image src="/brand/cye-emblem.png" alt="" width={491} height={474} sizes="36px" className="h-9 w-auto rounded-full bg-white p-0.5" />
          <div className="leading-tight text-white">
            <p className="font-heading text-sm font-black uppercase">CYE Admin</p>
            <p className="text-[11px] text-white/60">Capital Youth Expo 2026</p>
          </div>
        </div>
        <details className="mt-4 lg:hidden">
          <summary className="cursor-pointer rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">Menu</summary>
          <div className="mt-2">{nav}</div>
        </details>
        <div className="mt-6 hidden h-[calc(100%-4rem)] lg:block">{nav}</div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
