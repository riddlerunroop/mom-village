"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const DURATIONS = [
  "Less than 2 weeks",
  "2 to 4 weeks",
  "More than a month",
  "I'm not sure",
];

const FEELINGS = [
  "Persistent sadness or crying",
  "Constant worry or racing thoughts",
  "Feeling numb or disconnected from my baby",
  "Trouble sleeping, even when I have the chance",
  "Sleeping much more than usual",
  "Loss of interest in things I'd normally enjoy",
  "Trouble concentrating or making decisions",
  "Unwanted thoughts that scare me",
  "Feeling on edge or unable to relax",
  "Guilt about not feeling the way I think I 'should'",
];

const AFFECTING = [
  "Sleeping",
  "Eating",
  "Caring for myself",
  "Caring for my baby",
  "Work or daily tasks",
  "My relationships",
];

export default function PrepareClient() {
  const [duration, setDuration] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [affecting, setAffecting] = useState<string[]>([]);
  const [safety, setSafety] = useState<"" | "yes" | "no" | "prefer_not">("");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const script = useMemo(() => {
    const lines: string[] = [];
    lines.push("Something I'd like to talk to you about:");
    lines.push("");
    if (duration) {
      lines.push(`I've been feeling this way for ${duration.toLowerCase()}.`);
    }
    if (feelings.length > 0) {
      lines.push(`What I've been noticing: ${feelings.join("; ")}.`);
    }
    if (affecting.length > 0) {
      lines.push(`It's been affecting: ${affecting.join(", ").toLowerCase()}.`);
    }
    if (extra.trim()) {
      lines.push(`Anything else I want them to know: ${extra.trim()}`);
    }
    if (!duration && feelings.length === 0 && affecting.length === 0 && !extra.trim()) {
      lines.push("I've been finding this a hard stretch and I want to talk it through with you.");
    }
    return lines.join("\n");
  }, [duration, feelings, affecting, extra]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable — she can still select and copy manually
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-ivory-2 rounded-2xl border border-line p-6">
        <h2 className="font-display text-lg text-indigo mb-3">
          Have you had thoughts of harming yourself or your baby?
        </h2>
        <p className="text-xs text-ink/50 mb-3">
          This is a standard, real question — not a test. Answering honestly
          helps you get the right kind of support.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["yes", "no", "prefer_not"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSafety(v)}
              className={`text-sm font-semibold px-5 py-2 rounded-full border-[1.5px] ${
                safety === v
                  ? "bg-terracotta text-ivory border-terracotta"
                  : "border-line text-ink/70"
              }`}
            >
              {v === "yes" ? "Yes" : v === "no" ? "No" : "Prefer not to say"}
            </button>
          ))}
        </div>
        {safety === "yes" && (
          <div className="mt-4 bg-terracotta/10 border border-terracotta/30 rounded-xl p-4">
            <p className="text-sm text-ink/80 mb-2">
              Thank you for telling me. Please don&apos;t wait to get support
              — this matters more than finishing this form.
            </p>
            <Link
              href="/safety"
              className="inline-block text-sm font-semibold px-5 py-2 rounded-full bg-terracotta text-ivory"
            >
              Go to emergency numbers and support →
            </Link>
          </div>
        )}
      </div>

      <div className="bg-ivory-2 rounded-2xl border border-line p-6">
        <h2 className="font-display text-lg text-indigo mb-3">
          How long has this been going on?
        </h2>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`text-sm font-medium px-4 py-2 rounded-full border-[1.5px] ${
                duration === d
                  ? "bg-sage-deep text-ivory border-sage-deep"
                  : "border-line text-ink/70"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ivory-2 rounded-2xl border border-line p-6">
        <h2 className="font-display text-lg text-indigo mb-3">
          What have you been noticing? (pick any that fit)
        </h2>
        <div className="flex flex-wrap gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggle(feelings, setFeelings, f)}
              className={`text-sm font-medium px-4 py-2 rounded-full border-[1.5px] text-left ${
                feelings.includes(f)
                  ? "bg-gold-deep text-ivory border-gold-deep"
                  : "border-line text-ink/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ivory-2 rounded-2xl border border-line p-6">
        <h2 className="font-display text-lg text-indigo mb-3">
          Is it affecting any of these? (pick any that fit)
        </h2>
        <div className="flex flex-wrap gap-2">
          {AFFECTING.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggle(affecting, setAffecting, a)}
              className={`text-sm font-medium px-4 py-2 rounded-full border-[1.5px] ${
                affecting.includes(a)
                  ? "bg-indigo text-ivory border-indigo"
                  : "border-line text-ink/70"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ivory-2 rounded-2xl border border-line p-6">
        <h2 className="font-display text-lg text-indigo mb-3">
          Anything else you&apos;d want them to know? (optional)
        </h2>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={3}
          placeholder="Write in your own words, if you want to..."
          className="w-full rounded-xl border border-line p-3 text-sm bg-ivory"
        />
      </div>

      <div className="bg-indigo rounded-2xl p-6 text-ivory">
        <h2 className="font-display text-lg mb-3">Your script</h2>
        <p className="text-xs text-ivory/60 mb-3">
          Nothing here is saved anywhere — it only exists on your screen right
          now. Copy it and share it however feels easiest: read it aloud, send
          it as a message, or show it to your doctor.
        </p>
        <pre className="whitespace-pre-wrap text-sm bg-ivory/10 rounded-xl p-4 mb-4 font-sans">
          {script}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
        >
          {copied ? "Copied!" : "Copy this text"}
        </button>
      </div>
    </div>
  );
}
