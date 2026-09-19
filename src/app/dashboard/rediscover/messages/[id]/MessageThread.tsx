"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function MessageThread({
  conversationId,
  selfId,
  initialMessages,
}: {
  conversationId: string;
  selfId: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark any messages from the other person as read on open — a light,
  // best-effort call, not something the UI blocks on.
  useEffect(() => {
    supabase
      .from("rediscover_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", selfId)
      .is("read_at", null)
      .then(() => {});
  }, [conversationId, selfId, supabase]);

  async function send() {
    if (!body.trim() || sending) return;
    setSending(true);
    const text = body.trim();
    setBody("");

    const { data, error } = await supabase
      .from("rediscover_messages")
      .insert({ conversation_id: conversationId, sender_id: selfId, body: text })
      .select("id, sender_id, body, created_at")
      .single();

    setSending(false);
    if (!error && data) {
      setMessages((prev) => [...prev, data as Message]);
    } else {
      setBody(text);
    }
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.sender_id === selfId
                ? "ml-auto bg-indigo text-ivory"
                : "bg-ivory-2 border border-line text-ink"
            }`}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-line">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Write a message…"
          maxLength={2000}
          className="flex-1 rounded-full border border-line px-4 py-2 text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          className="text-sm font-semibold px-5 py-2 rounded-full bg-indigo text-ivory disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
