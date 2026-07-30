"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// New 2026-07-30 — audit finding #17 (Nice to have). The desktop nav's
// "Explore" dropdown was pure CSS hover (`group`/`group-hover`), which
// doesn't work reliably on touch/hybrid devices (a touchscreen laptop or
// tablet in landscape, above the `lg` breakpoint where the hamburger menu
// no longer shows). This adds a real click-to-toggle on top of the
// existing hover behavior — hover still works for mouse users, tapping
// works for touch users, and tapping outside or picking a link closes it.

const EXPLORE_ITEMS = [
  { label: "Wealth", href: "/dashboard/wealth" },
  { label: "Care", href: "/dashboard/care" },
  { label: "Library", href: "/dashboard/library" },
  { label: "Community", href: "/dashboard/community" },
];

export default function ExploreDropdown({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  const dest = (path: string) =>
    isLoggedIn ? path : `/login?next=${encodeURIComponent(path)}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <li ref={ref} className="group relative whitespace-nowrap">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 hover:text-gold-deep transition-colors py-2"
      >
        Explore
        <span className="text-[10px] mt-px">▾</span>
      </button>
      <div
        className={`absolute left-0 top-full transition-all duration-150 z-20 ${
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0"
        }`}
      >
        <div className="bg-ivory rounded-xl border border-line shadow-lg py-2 mt-1 min-w-[160px]">
          {EXPLORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={dest(item.href)}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink hover:bg-ivory-2 hover:text-gold-deep transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}
