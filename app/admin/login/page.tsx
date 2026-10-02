import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in | CYE 2026", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-wash-mist px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-white bg-white p-8 shadow-card">
        <Image src="/brand/cye-emblem.png" alt="" width={491} height={474} sizes="56px" className="mx-auto h-14 w-auto" priority />
        <h1 className="mt-4 text-center font-heading text-xl font-black uppercase text-cye-blue">CYE Admin</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to manage submissions and site content.</p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
