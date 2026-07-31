// Loads a book's paginated content JSON by slug. Content files are bundled
// directly into the app (content/library/*.json, copied verbatim from the
// website's same source) — Metro bundles JSON via require() synchronously,
// unlike web's dynamic import(), so this loader is sync rather than async.

import type { LibraryBookContent } from "../types/library-content";

const CONTENT_LOADERS: Record<string, () => LibraryBookContent> = {
  "money-understood": () => require("../content/library/money-understood.json"),
  "creating-your-own-opportunities": () =>
    require("../content/library/creating-your-own-opportunities.json"),
  "building-your-financial-security": () =>
    require("../content/library/building-your-financial-security.json"),
  "understanding-your-little-one": () =>
    require("../content/library/understanding-your-little-one.json"),
  "guiding-your-growing-child": () =>
    require("../content/library/guiding-your-growing-child.json"),
  "supporting-your-childs-growing-independence": () =>
    require("../content/library/supporting-your-childs-growing-independence.json"),
};

export function loadBookContent(slug: string): LibraryBookContent | null {
  const loader = CONTENT_LOADERS[slug];
  if (!loader) return null;
  return loader();
}
