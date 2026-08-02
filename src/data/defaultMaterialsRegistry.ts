import type { Material } from "../types/material.ts";
import { defaultEnglishSentences } from "./defaultEnglishSentences.ts";
import { defaultChineseArticles } from "./defaultChineseArticles.ts";
import { defaultEnglishFables } from "./defaultEnglishFables.ts";
import { defaultChineseClassics } from "./defaultChineseClassics.ts";

export const DEFAULT_MATERIALS_VERSION = "v5";

export interface DefaultMaterialDef {
  id: string;
  name: string;
  type: Material["type"];
  buildMaterial: () => Promise<Material>;
}

// Helper to build an xlsx-based wordlist material
async function makeXlsxMaterial(opts: {
  id: string; name: string; file: string; sheet?: number;
  startRow?: number; endRow?: number;
  enCol: number; zhCol: number; phoneticUkCol?: number; phoneticUsCol?: number;
}): Promise<Material> {
  const resp = await fetch(import.meta.env.BASE_URL + "default-materials/" + encodeURIComponent(opts.file));
  if (!resp.ok) throw new Error("Failed to load " + opts.file + ": " + resp.status);
  const buffer = await resp.arrayBuffer();
  const { read, utils } = await import("xlsx");
  const wb = read(buffer, { type: "array" });
  const sheetIdx = opts.sheet ?? 0;
  const sheet = wb.Sheets[wb.SheetNames[sheetIdx]];
  const rows: unknown[][] = utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });
  const entries: Material["entries"] = [];
  let id = 0;
  const start = opts.startRow ?? 0;
  const end = opts.endRow && opts.endRow > 0 ? opts.endRow : rows.length;
  for (let i = start; i < end && i < rows.length; i++) {
    const row = rows[i];
    const en = String(row[opts.enCol] ?? "").trim();
    const zh = String(row[opts.zhCol] ?? "").trim();
    if (!en && !zh) continue;
    if (/^(Unit\s*\d+|第\s*\d+\s*单元?|单元?\s*\d+)$/i.test(en)) continue;
    id++;
    entries.push({
      id,
      english: en,
      chinese: zh,
      phonetic_uk: opts.phoneticUkCol != null ? (String(row[opts.phoneticUkCol] ?? "").trim() || undefined) : undefined,
      phonetic_us: opts.phoneticUsCol != null ? (String(row[opts.phoneticUsCol] ?? "").trim() || undefined) : undefined,
    });
  }
  return { id: opts.id, name: opts.name, type: "wordlist", source: "builtin", sourceFile: "default-materials/" + opts.file, importedAt: Date.now(), entries, wordCount: entries.length };
}

export const DEFAULT_MATERIALS: DefaultMaterialDef[] = [
  // ---- 三年级上册 ----
  {
    id: "builtin-xlsx-3a",
    name: "三年级英语上册",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-3a", name: "三年级英语上册", file: "三年级英语单词音标表.xlsx", sheet: 0, startRow: 2, enCol: 1, zhCol: 3, phoneticUkCol: 2 }),
  },
  // ---- 三年级下册 ----
  {
    id: "builtin-xlsx-3b",
    name: "三年级英语下册",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-3b", name: "三年级英语下册", file: "三年级英语单词音标表.xlsx", sheet: 1, startRow: 2, enCol: 1, zhCol: 3, phoneticUkCol: 2 }),
  },
  // ---- 四年级下册 ----
  {
    id: "builtin-xlsx-wordlist-2",
    name: "四年级英语下册",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-wordlist-2", name: "四年级英语下册", file: "四下英语单词音标表.xlsx", startRow: 3, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  // ---- 四年级上册 (四+五词汇表 rows 239-401) ----
  {
    id: "builtin-xlsx-4a",
    name: "四年级英语上册",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-4a", name: "四年级英语上册", file: "四+五上词汇表.xlsx", startRow: 238, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  // ---- 五年级上册 (四+五词汇表 rows 120-238) ----
  {
    id: "builtin-xlsx-5a",
    name: "五年级英语上册",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-5a", name: "五年级英语上册", file: "四+五上词汇表.xlsx", startRow: 119, endRow: 238, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  // ---- 保留：英文短句 ----
  {
    id: "builtin-en-sentences",
    name: "英文短句练习",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-sentences", name: "英文短句练习", type: "article_en", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultEnglishSentences,
      wordCount: defaultEnglishSentences.reduce((s, x) => s + (x.type === "paragraph" ? x.content.split(/\s+/).length : 0), 0),
    }),
  },
  // ---- 保留：中文段落 ----
  {
    id: "builtin-zh-articles",
    name: "中文段落练习",
    type: "article_zh",
    buildMaterial: async () => ({
      id: "builtin-zh-articles", name: "中文段落练习", type: "article_zh", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultChineseArticles,
      wordCount: defaultChineseArticles.reduce((s, x) => s + (x.type === "paragraph" ? x.content.length : 0), 0),
    }),
  },
  // ---- 保留：英文寓言 ----
  {
    id: "builtin-en-fables",
    name: "英文寓言三则",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-fables", name: "英文寓言三则", type: "article_en", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultEnglishFables,
      wordCount: defaultEnglishFables.reduce((s, x) => s + (x.type === "paragraph" ? x.content.split(/\s+/).length : 0), 0),
    }),
  },
  // ---- 保留：古文经典 ----
  {
    id: "builtin-zh-classics",
    name: "五上古文经典与诗词",
    type: "article_zh",
    buildMaterial: async () => ({
      id: "builtin-zh-classics", name: "五上古文经典与诗词", type: "article_zh", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultChineseClassics,
      wordCount: defaultChineseClassics.reduce((s, x) => s + (x.type === "paragraph" ? x.content.length : 0), 0),
    }),
  },
];