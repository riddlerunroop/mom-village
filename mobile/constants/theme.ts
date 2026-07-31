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

export const Fonts = {
  // Fraunces/Karla aren't loaded natively yet (first pass uses system
  // fonts) — swap in expo-font + the real brand fonts in a later pass,
  // same note the web app has for its own PDF cover-page fallback.
  display: undefined,
  body: undefined,
};
