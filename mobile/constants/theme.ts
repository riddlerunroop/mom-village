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
