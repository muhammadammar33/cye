"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/data/event";
import { cn } from "@/lib/cn";

function hashId(href: string) {
  return href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
}

export function Navbar() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24 || pathname !== "/");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const ids = NAV_LINKS.map((link) => hashId(link.href)).filter(Boolean);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveHash(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function isActive(href: string) {
    if (href.startsWith("/") && !href.includes("#")) {
      return pathname === href;
    }
    return pathname === "/" && hashId(href) === activeHash;
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid || open ? "bg-white/95 shadow-sm backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        <Logo compact priority />
        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <li
                key={link.label}
                ref={menuRef}
                className="relative"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="register-menu"
                  // Mouse users already opened it on hover; keyboard activation (detail 0) toggles.
                  onClick={(event) => setMenuOpen((prev) => (event.detail === 0 ? !prev : true))}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                    link.children.some((child) => isActive(child.href))
                      ? "bg-cye-mist text-cye-blue"
                      : "text-cye-ink/70 hover:text-cye-blue",
                  )}
                >
                  {link.label}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>
                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      id="register-menu"
                      initial={{ opacity: 0, x: "-50%", y: 8 }}
                      animate={{ opacity: 1, x: "-50%", y: 0 }}
                      exit={{ opacity: 0, x: "-50%", y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-1/2 top-full w-80 pt-3"
                    >
                      <ul className="rounded-3xl border border-cye-blue/10 bg-white p-2 shadow-card">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "block rounded-2xl px-4 py-3 transition-colors hover:bg-cye-mist",
                                isActive(child.href) && "bg-cye-mist",
                              )}
                            >
                              <span className="block text-sm font-bold text-cye-blue">{child.label}</span>
                              {child.desc ? (
                                <span className="mt-0.5 block text-xs text-cye-ink/60">{child.desc}</span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                    isActive(link.href)
                      ? "bg-cye-mist text-cye-blue"
                      : "text-cye-ink/70 hover:text-cye-blue",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ),
          )}
        </ul>
        <div className="hidden xl:block">
          <Button href="/#contact">Become a Sponsor</Button>
        </div>
        <button
          type="button"
          className="inline-flex rounded-full border border-cye-blue/15 p-2 text-cye-blue xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-cye-blue/10 bg-white xl:hidden"
          >
            <ul className="flex max-h-[calc(100dvh-4.5rem)] flex-col gap-1 overflow-y-auto px-5 py-4">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <li key={link.label}>
                    <p className="px-3 pt-3 pb-1 font-heading text-xs font-bold uppercase tracking-[0.2em] text-cye-orange">
                      {link.label}
                    </p>
                    <ul className="grid grid-cols-2 gap-1">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-2xl bg-cye-mist px-3 py-2.5 text-sm font-semibold text-cye-blue"
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-2xl px-3 py-3 font-heading text-sm font-bold uppercase tracking-wide text-cye-blue"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
              <li className="pt-2" onClick={() => setOpen(false)}>
                <Button href="/#contact" className="w-full">
                  Become a Sponsor
                </Button>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
