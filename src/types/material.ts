export type MaterialType = "wordlist" | "article_en" | "article_zh";

export type MaterialSource = "builtin" | "user";

export interface WordEntry {
  id: number;
  english: string;
  chinese: string;
  phonetic_uk?: string;
  phonetic_us?: string;
}

export interface ArticleSegment {
  type: "paragraph" | "translation";
  content: string;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  source: MaterialSource;
  sourceFile: string;
  importedAt: number;
  entries?: WordEntry[];
  tags?: string[];
  segments?: ArticleSegment[];
  wordCount?: number;
}

export interface MaterialMeta {
  id: string;
  name: string;
  type: MaterialType;
  source: MaterialSource;
  importedAt: number;
  wordCount?: number;
  entryCount?: number;
}
