// Shape of the paginated book JSON files under content/library/ — ported
// verbatim from the web app's src/types/library-content.ts (same content
// files, copied as-is, so the shape must match exactly).

export type LibraryBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "box"; label: string; text: string }
  | { type: "table"; rows: string[][] };

export interface LibraryPage {
  chapterNumber: number;
  chapterTitle: string | null;
  epigraph: string | null;
  isChapterStart: boolean;
  blocks: LibraryBlock[];
}

export interface LibraryBookContent {
  pages: LibraryPage[];
}
