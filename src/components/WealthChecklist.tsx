"use client";

// Small, real, saving "what to do first" checklist — used atop both Wealth
// pages per Roop's 2026-07-28 review. Item keys are globally unique across
// both call sites (no page column needed on user_wealth_checklist), so the
// same checked-off item shows consistently wherever it appears.

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ChecklistItem = {
  key: string;
  label: string;
  href?: string;
};

export default function WealthChecklist({
  title,
  items,
}: {
  title: string;
  items: ChecklistItem[];
}) {
  const supabase = createClient();
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("user_wealth_checklist")
        .select("item_key")
        .eq("user_id", user.id)
        .in("item_key", items.map((i) => i.key));
      setDoneKeys(new Set((data || []).map((r) => r.item_key)));
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(key: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const isDone = doneKeys.has(key);
    const next = new Set(doneKeys);
    if (isDone) {
      next.delete(key);
      setDoneKeys(next);
      await supabase
        .from("user_wealth_checklist")
        .delete()
        .eq("user_id", user.id)
        .eq("item_key", key);
    } else {
      next.add(key);
      setDoneKeys(next);
      await supabase
        .from("user_wealth_checklist")
        .upsert({ user_id: user.id, item_key: key }, { onConflict: "user_id,item_key" });
    }
  }

  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-5 mb-8">
      <p className="text-xs uppercase tracking-wide font-semibold text-sage-deep mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => {
          const done = doneKeys.has(item.key);
          return (
            <li key={item.key} className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggle(item.key)}
                disabled={!loaded}
                aria-label={done ? "Mark not done" : "Mark done"}
                className={`shrink-0 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                  done
                    ? "bg-sage-deep border-sage-deep text-ivory"
                    : "border-ink/30 text-transparent hover:border-sage-deep/60"
                }`}
              >
                ✓
              </button>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`text-sm ${done ? "text-ink/40 line-through decoration-1" : "text-ink/85 hover:text-gold-deep"} transition-colors`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`text-sm ${done ? "text-ink/40 line-through decoration-1" : "text-ink/85"}`}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
