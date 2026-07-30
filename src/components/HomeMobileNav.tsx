"use client";

import { useState } from "react";
import Link from "next/link";

// New 2026-07-30 — audit finding #1 (Critical). The homepage's main nav was
// wrapped in `hidden lg:flex` with no mobile alternative at all: below
// ~1024px width, a visitor had literally no way to navigate the site except
// the two hero buttons. This is a real hamburger menu covering the same
// links as the desktop nav, shown only below `lg`.

const EXPLORE_ITEMS = [
  { label: "Wealth", href: "/dashboard/wealth" },
  { label: "Care", href: "/dashboard/care" },
  { label: "Library", href: "/dashboard/library" },
  { label: "Community", href: "/dashboard/community" },
];

export default function HomeMobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const dest = (path: string) =>
    isLoggedIn ? path : `/login?next=${encodeURIComponent(path)}`;

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col justify-center gap-[5px] w-9 h-9 shrink-0"
      >
        <span
          className={`block h-[2px] w-6 bg-indigo transition-transform ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-indigo transition-opacity ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-indigo transition-transform ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="fixed inset-0 top-[76px] z-30 bg-ivory overflow-y-auto">
          <ul className="flex flex-col gap-1 px-8 py-6 text-base text-ink">
            <li>
              <Link
                href={dest("/dashboard")}
                onClick={close}
                className="block py-3 border-b border-line"
              >
                Monthly chart
              </Link>
            </li>
            {EXPLORE_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={dest(item.href)}
                  onClick={close}
                  className="block py-3 border-b border-line"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!isLoggedIn && (
              <li>
                <Link
                  href="#pricing"
                  onClick={close}
                  className="block py-3 border-b border-line"
                >
                  Pricing
                </Link>
              </li>
            )}
            <li className="pt-5">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard/account"
                    onClick={close}
                    className="text-sm font-semibold text-indigo"
                  >
                    Your account
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="inline-block text-center text-sm font-semibold px-6 py-3 rounded-full bg-gold-deep text-ivory"
                  >
                    Go to dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={close}
                    className="text-sm font-semibold text-indigo"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    onClick={close}
                    className="inline-block text-center text-sm font-semibold px-6 py-3 rounded-full bg-gold-deep text-ivory"
                  >
                    Join the village
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
