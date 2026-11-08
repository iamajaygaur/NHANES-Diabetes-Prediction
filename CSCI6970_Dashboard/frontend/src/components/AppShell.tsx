"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Briefcase,
  Check,
  ChevronDown,
  Code2,
  HelpCircle,
  LayoutTemplate,
  Mail,
  Menu,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DemoTour } from "@/components/DemoTour";
import { useTheme } from "@/components/theme-provider";
import { NAV_ITEMS } from "@/lib/nav";
import { CREATOR, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type HeaderDensity = "spacious" | "compact";
/* v2: default compact so returning visitors aren't stuck on oversized spacious */
const HEADER_DENSITY_KEY = "diabetesinsight-header-density-v2";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [density, setDensity] = useState<HeaderDensity>("compact");
  const { theme, setTheme } = useTheme();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(HEADER_DENSITY_KEY);
    if (stored === "compact" || stored === "spacious") setDensity(stored);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    function onPointer(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  function chooseDensity(next: HeaderDensity) {
    setDensity(next);
    window.localStorage.setItem(HEADER_DENSITY_KEY, next);
  }

  return (
    <div
      className="shell-bg min-h-screen text-[var(--foreground)]"
      data-density={density}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="header-veil" aria-hidden />
      <header
        data-density={density}
        className={cn(
          "float-header transition-all duration-300",
          scrolled && "is-scrolled",
        )}
      >
        {/*
          Amplo: SEPARATE pills (not one mono shell) —
          brand · long nav · search · theme · New · creator
          Density: compact (default) | spacious
        */}
        <div className="header-row flex items-center gap-2 lg:gap-3">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 lg:flex-none",
              "float-header-mobile-shell px-2 py-2 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-filter-none lg:[border:none]",
            )}
          >
            <Link
              href="/"
              aria-label={`${SITE.productName} home`}
              className="header-pill flex min-w-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
              >
                <Activity className="h-3.5 w-3.5" strokeWidth={2.25} />
              </span>
              <span className="truncate font-display text-[13px] font-semibold leading-none tracking-[-0.02em]">
                Diabetes
                <span className="text-blue-600">Insight</span>
              </span>
            </Link>

            <button
              type="button"
              className="header-pill ml-auto rounded-2xl p-2.5 text-[var(--muted)] lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Long center nav pill */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="header-pill header-nav-pill inline-flex max-w-full items-center gap-0.5 overflow-x-auto scrollbar-none">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-medium transition xl:px-3.5 xl:text-[13px]",
                      active
                        ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] shadow-sm"
                        : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)] dark:hover:bg-white/5",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right utility pills */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              className="header-pill hidden items-center gap-2 rounded-full px-3.5 py-2.5 text-xs text-[var(--muted)] md:inline-flex"
              onClick={() => document.getElementById("dashboard-search")?.focus()}
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="header-pill rounded-2xl p-2.5 text-[var(--muted)]"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/predict"
              className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/25"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="header-pill flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-left"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label={`About the creator, ${CREATOR.name}`}
              >
                <span className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={CREATOR.photo}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="hidden min-w-0 lg:block">
                  <span className="block truncate text-xs font-semibold leading-tight">
                    Creator
                  </span>
                  <span className="block truncate text-[10px] leading-tight text-[var(--muted)]">
                    {CREATOR.name}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-[var(--muted)] transition",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>

              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(18rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl"
                >
                  <div className="flex items-center gap-3 rounded-xl bg-[var(--panel-strong)] px-2.5 py-2.5">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={CREATOR.photo}
                        alt={CREATOR.name}
                        fill
                        sizes="44px"
                        className="object-cover object-top"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Researched &amp; developed by
                      </p>
                      <p className="truncate text-sm font-semibold">{CREATOR.name}</p>
                      <p className="truncate text-xs text-[var(--muted)]">{CREATOR.role}</p>
                    </div>
                  </div>

                  <p className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Your view
                  </p>
                  <div className="space-y-0.5">
                    {(
                      [
                        ["light", "Light", Sun],
                        ["dark", "Dark", Moon],
                      ] as const
                    ).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        type="button"
                        role="menuitem"
                        onClick={() => setTheme(id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm",
                          theme === id
                            ? "bg-[var(--soft)] font-medium"
                            : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{label}</span>
                        {theme === id ? <Check className="h-4 w-4 text-blue-600" /> : null}
                      </button>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      disabled
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-[var(--muted)] opacity-60"
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="flex-1 text-left">Match system</span>
                    </button>
                  </div>

                  <p className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Header style
                  </p>
                  <div className="space-y-0.5">
                    {(
                      [
                        ["compact", "Compact"],
                        ["spacious", "Spacious"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="menuitem"
                        onClick={() => chooseDensity(id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm",
                          density === id
                            ? "bg-[var(--soft)] font-medium"
                            : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <LayoutTemplate className="h-4 w-4" />
                        <span className="flex-1 text-left">{label}</span>
                        {density === id ? <Check className="h-4 w-4 text-blue-600" /> : null}
                      </button>
                    ))}
                  </div>

                  <div className="my-2 border-t border-[var(--border)]" />

                  <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Connect with {CREATOR.name.split(" ")[0]}
                  </p>
                  <Link
                    href="/connect"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--panel-strong)]"
                  >
                    <UserRound className="h-4 w-4" />
                    Get connected
                  </Link>
                  <a
                    href={CREATOR.links.github}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--panel-strong)]"
                  >
                    <Code2 className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href={CREATOR.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--panel-strong)]"
                  >
                    <Briefcase className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    href={`mailto:${CREATOR.email}`}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--panel-strong)]"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                  <Link
                    href="/project"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-[var(--panel-strong)]"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Project details
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {open ? (
          <div className="float-header-mobile-shell mt-2 px-3 py-3 lg:hidden">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-2">
              <span className="relative h-11 w-11 overflow-hidden rounded-xl">
                <Image
                  src={CREATOR.photo}
                  alt={CREATOR.name}
                  fill
                  sizes="44px"
                  className="object-cover object-top"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Creator
                </p>
                <p className="truncate text-sm font-semibold">{CREATOR.name}</p>
                <p className="truncate text-xs text-[var(--muted)]">
                  Researched &amp; developed this app
                </p>
              </div>
              <Link
                href="/connect"
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Meet
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main id="content" className="page-container min-w-0 overflow-x-clip">
        {children}
      </main>

      <DemoTour />

      <footer className="page-container border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        <p>
          {SITE.productName} · {SITE.researchTitle}
        </p>
        <p className="mt-1">
          Researched &amp; developed by{" "}
          <Link href="/connect" className="font-medium text-blue-600 hover:underline">
            {CREATOR.name}
          </Link>
          {" · "}
          Not a medical diagnostic system
        </p>
      </footer>
    </div>
  );
}
