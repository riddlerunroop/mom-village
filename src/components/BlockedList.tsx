"use client";

// Makes blocking reversible — a mother can see who she's blocked in
// Community and undo it, rather than it being a one-way action she can't
// manage. See migration_30_community_blocks.sql.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BlockedList() {
  const supabase = createClient();
  const [blocked, setBlocked] = useState<{ id: string; name: string }[]>([]);
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
      const { data: rows } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id);
      const ids = (rows || []).map((r) => r.blocked_id);
      if (ids.length === 0) {
        setLoaded(true);
        return;
      }
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", ids);
      setBlocked(
        (authors || []).map((a) => ({ id: a.id, name: a.mom_name || "A mom in the village" }))
      );
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unblock(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("user_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", id);
  }

  if (!loaded) return null;
  if (blocked.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        You haven&apos;t blocked anyone in Community.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {blocked.map((b) => (
        <li key={b.id} className="flex items-center justify-between">
          <span className="text-sm text-ink/80">{b.name}</span>
          <button
            type="button"
            onClick={() => unblock(b.id)}
            className="text-xs font-semibold text-sage-deep hover:text-terracotta"
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}
