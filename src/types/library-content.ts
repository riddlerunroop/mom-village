// Shape of the paginated book JSON files under src/content/library/.
// Generated offline from each locked manuscript — see project notes for
// the conversion pipeline (docx -> HTML -> parsed blocks -> paginated).

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
