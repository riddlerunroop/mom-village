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

export default function DashboardNav({
  promptBirth = false,
}: {
  promptBirth?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-ivory-2">
      <div className="max-w-[900px] mx-auto px-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const showBadge = promptBirth && tab.href === "/dashboard";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-gold-deep text-indigo"
                  : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {tab.label}
              {showBadge && (
                <span className="absolute top-2 right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
