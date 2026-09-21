// Mom Village brand tokens — kept in lockstep with the web app's design
// tokens (see the main repo's CLAUDE.md "Design tokens" line). Native app
// doesn't do dark mode differently from web yet — one palette for now.

export const Colors = {
  ink: "#2B2420",
  indigo: "#1F2E4D",
  gold: "#D9A441",
  goldDeep: "#A97418",
  terracotta: "#BE6240",
  ivory: "#FBF4E8",
  ivory2: "#F4E9D8",
  sageDeep: "#5F7052",
  line: "#E5D9C3",
};

// Shared "flat card" language, matched against Roop's mockups: a thin
// hairline border instead of a visible drop shadow, and ONE consistent
// icon color per screen/pillar (navy on Today/Care, gold on Wealth) rather
// than a different accent color per icon — the mockups never mix icon
// colors within the same screen, which is what made the earlier pass read
// as "busier" than the reference.
export const CardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.line,
};

export function iconBadge(color: string, size: number = 40) {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: Colors.ivory,
    borderWidth: 1.5,
    borderColor: color + "55",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
}

export const Fonts = {
  // Loaded via expo-font + @expo-google-fonts/{fraunces,karla} in the root
  // layout (see app/_layout.tsx) — matches the web app's Fraunces (display)
  // + Karla (body) pairing exactly, instead of falling back to system fonts.
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  displayItalic: "Fraunces_600SemiBold_Italic",
  body: "Karla_400Regular",
  bodySemiBold: "Karla_600SemiBold",
  bodyBold: "Karla_700Bold",
};

// Care Chart card consistency pass, 2026-09-21 — Roop's live feedback:
// today's chart read as "chaotic" because Move/Nourish/Care for
// yourself/Reset/etc. were each built on a different card treatment (some
// plain white + shadow, some plain white + border, Reset alone tinted with
// a colored top border), and each module's title used a different
// font/weight/size. moduleCard() gives every daily-chart card Reset's own
// tinted/top-border shape (each module keeps its own accent color so
// they're still visually distinguishable), while moduleTitle is the ONE
// shared heading style — same font, same weight, same color — every
// module's name (Move / Nourish / Reset / Care for yourself / etc.) now
// renders in. Do not give a module's title its own one-off color/weight
// again; add a new accent to a moduleCard() call instead.
export function moduleCard(accentColor: string) {
  return {
    backgroundColor: accentColor + "14",
    borderTopWidth: 3,
    borderTopColor: accentColor,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  };
}

export const moduleTitle = {
  fontFamily: Fonts.displayBold,
  fontSize: 18,
  color: Colors.indigo,
};

// A quiet, secondary caption — for things like Care for Yourself's
// "MONDAY · FACE TIME" day/category label, which must read as smaller and
// less insistent than the module's real heading (moduleTitle above), never
// competing with it for attention.
export const moduleEyebrow = {
  fontFamily: Fonts.bodySemiBold,
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  color: Colors.ink + "70",
};
