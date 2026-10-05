"use client";

import { ExternalLink, FileText, Gauge, History, Inbox, LogOut, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const MAIN = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
];

export function AdminNav({ content, name, newCount }: { content: { key: string; label: string }[]; name: string; newCount: number }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const link = (href: string, active: boolean) =>
    cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition", active ? "bg-white text-cye-blue shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white");

  return (
    <nav className="flex h-full flex-col gap-1 text-white">
      {MAIN.map(({ href, label, icon: Icon, exact }) => (
        <Link key={href} href={href} className={link(href, isActive(href, exact))}>
          <Icon className="h-4 w-4" aria-hidden />
          {label}
          {href === "/admin/submissions" && newCount > 0 ? (
            <span className="ml-auto rounded-full bg-cye-orange px-2 py-0.5 text-[11px] font-bold text-white">{newCount}</span>
          ) : null}
        </Link>
      ))}
      <p className="mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-white/50">Site content</p>
      {content.map(({ key, label }) => (
        <Link key={key} href={`/admin/content/${key}`} className={link(`/admin/content/${key}`, isActive(`/admin/content/${key}`))}>
          <FileText className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
      <p className="mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-white/50">Manage</p>
      <Link href="/admin/settings" className={link("/admin/settings", isActive("/admin/settings"))}>
        <Settings className="h-4 w-4" aria-hidden />
        Settings
      </Link>
      <Link href="/admin/admins" className={link("/admin/admins", isActive("/admin/admins"))}>
        <Users className="h-4 w-4" aria-hidden />
        Admins
      </Link>
      <Link href="/admin/activity" className={link("/admin/activity", isActive("/admin/activity"))}>
        <History className="h-4 w-4" aria-hidden />
        Activity log
      </Link>
      <div className="mt-auto space-y-1 border-t border-white/15 pt-4">
        <Link href="/" target="_blank" className={link("/", false)}>
          <ExternalLink className="h-4 w-4" aria-hidden />
          View website
        </Link>
        <form action={logout}>
          <button type="submit" className={cn(link("", false), "w-full")}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-white/50">Signed in as {name}</p>
      </div>
    </nav>
  );
}
