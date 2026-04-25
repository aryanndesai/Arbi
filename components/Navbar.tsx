"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ModeToggle from "@/components/ModeToggle";

const navLinks = [
  { href: "/trips", label: "Browse trips" },
  { href: "/post-trip", label: "Post a trip" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <h1 className="flex items-baseline gap-1.5 text-3xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">
            <span>Arbi</span>
            <span
              aria-hidden
              className="text-2xl sm:text-[1.7rem] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ✈️
            </span>
          </h1>
          <span className="hidden lg:inline-block text-[10px] text-gray-400 tracking-wide ml-1 self-end pb-1">
            carry more, earn more
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gray-900 transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link
            href="/dashboard"
            className="hidden sm:inline-block px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            My account
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 animate-arbi-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "text-gray-900 font-medium bg-gray-100"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="sm:hidden mt-1 px-3 py-2.5 rounded-xl bg-black text-white text-sm font-medium text-center"
            >
              My account
            </Link>
          </div>
        </div>
      ) : null}

      <div className="h-px arbi-gradient-border" />
    </nav>
  );
}
