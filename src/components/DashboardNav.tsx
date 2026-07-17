"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Monthly chart", href: "/dashboard" },
  { label: "Fitness", href: "/dashboard/care" }, // name still under discussion
  { label: "Wealth", href: "/dashboard/wealth" },
  { label: "Library", href: "/dashboard/library" },
  { label: "Community", href: "/dashboard/community" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-ivory-2">
      <div className="max-w-[900px] mx-auto px-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-gold-deep text-indigo"
                  : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
