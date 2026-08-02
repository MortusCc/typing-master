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
    id++;
    entries.push({ id, english: en, chinese: zh,
      phonetic_uk: opts.phoneticUkCol != null ? (String(row[opts.phoneticUkCol] ?? "").trim() || undefined) : undefined,
      phonetic_us: opts.phoneticUsCol != null ? (String(row[opts.phoneticUsCol] ?? "").trim() || undefined) : undefined,
    });
  }
  return { id: opts.id, name: opts.name, type: "wordlist", source: "builtin", sourceFile: "default-materials/" + opts.file, importedAt: Date.now(), entries, wordCount: entries.length };
}

export const DEFAULT_MATERIALS: DefaultMaterialDef[] = [
  {
    id: "builtin-test-10",
    name: "测试素材（10词）",
    type: "wordlist",
    buildMaterial: async () => ({
      id: "builtin-test-10", name: "测试素材（10词）", type: "wordlist", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      entries: [
        { id: 1, english: "apple", chinese: "\u82F9\u679C" },
        { id: 2, english: "banana", chinese: "\u9999\u8549" },
        { id: 3, english: "cat", chinese: "\u732B" },
        { id: 4, english: "dog", chinese: "\u72D7" },
        { id: 5, english: "elephant", chinese: "\u5927\u8C61" },
        { id: 6, english: "fish", chinese: "\u9C7C" },
        { id: 7, english: "grape", chinese: "\u8461\u8404" },
        { id: 8, english: "house", chinese: "\u623F\u5B50" },
        { id: 9, english: "ice", chinese: "\u51B0" },
        { id: 10, english: "jump", chinese: "\u8DF3" },
      ],
      wordCount: 10,
    }),
  },
  {
    id: "builtin-xlsx-3a",
    name: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-3a", name: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C", file: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u5355\u8BCD\u97F3\u6807\u8868.xlsx", sheet: 0, startRow: 2, enCol: 1, zhCol: 3, phoneticUkCol: 2 }),
  },
  {
    id: "builtin-xlsx-3b",
    name: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u4E0B\u518C",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-3b", name: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u4E0B\u518C", file: "\u4E09\u5E74\u7EA7\u82F1\u8BED\u5355\u8BCD\u97F3\u6807\u8868.xlsx", sheet: 1, startRow: 2, enCol: 1, zhCol: 3, phoneticUkCol: 2 }),
  },
  {
    id: "builtin-xlsx-wordlist-2",
    name: "\u56DB\u5E74\u7EA7\u82F1\u8BED\u4E0B\u518C",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-wordlist-2", name: "\u56DB\u5E74\u7EA7\u82F1\u8BED\u4E0B\u518C", file: "\u56DB\u4E0B\u82F1\u8BED\u5355\u8BCD\u97F3\u6807\u8868.xlsx", startRow: 3, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  {
    id: "builtin-xlsx-4a",
    name: "\u56DB\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-4a", name: "\u56DB\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C", file: "\u56DB+\u4E94\u4E0A\u8BCD\u6C47\u8868.xlsx", startRow: 238, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  {
    id: "builtin-xlsx-5a",
    name: "\u4E94\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C",
    type: "wordlist",
    buildMaterial: () => makeXlsxMaterial({ id: "builtin-xlsx-5a", name: "\u4E94\u5E74\u7EA7\u82F1\u8BED\u4E0A\u518C", file: "\u56DB+\u4E94\u4E0A\u8BCD\u6C47\u8868.xlsx", startRow: 119, endRow: 238, enCol: 1, zhCol: 4, phoneticUkCol: 2, phoneticUsCol: 3 }),
  },
  {
    id: "builtin-en-sentences",
    name: "\u82F1\u6587\u77ED\u53E5\u7EC3\u4E60",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-sentences", name: "\u82F1\u6587\u77ED\u53E5\u7EC3\u4E60", type: "article_en", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultEnglishSentences,
      wordCount: defaultEnglishSentences.reduce((s, x) => s + (x.type === "paragraph" ? x.content.split(/\s+/).length : 0), 0),
    }),
  },
  {
    id: "builtin-zh-articles",
    name: "\u4E2D\u6587\u6BB5\u843D\u7EC3\u4E60",
    type: "article_zh",
    buildMaterial: async () => ({
      id: "builtin-zh-articles", name: "\u4E2D\u6587\u6BB5\u843D\u7EC3\u4E60", type: "article_zh", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultChineseArticles,
      wordCount: defaultChineseArticles.reduce((s, x) => s + (x.type === "paragraph" ? x.content.length : 0), 0),
    }),
  },
  {
    id: "builtin-en-fables",
    name: "\u82F1\u6587\u5BD3\u8A00\u4E09\u5219",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-fables", name: "\u82F1\u6587\u5BD3\u8A00\u4E09\u5219", type: "article_en", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultEnglishFables,
      wordCount: defaultEnglishFables.reduce((s, x) => s + (x.type === "paragraph" ? x.content.split(/\s+/).length : 0), 0),
    }),
  },
  {
    id: "builtin-zh-classics",
    name: "\u4E94\u4E0A\u53E4\u6587\u7ECF\u5178\u4E0E\u8BD7\u8BCD",
    type: "article_zh",
    buildMaterial: async () => ({
      id: "builtin-zh-classics", name: "\u4E94\u4E0A\u53E4\u6587\u7ECF\u5178\u4E0E\u8BD7\u8BCD", type: "article_zh", source: "builtin", sourceFile: "builtin", importedAt: Date.now(),
      segments: defaultChineseClassics,
      wordCount: defaultChineseClassics.reduce((s, x) => s + (x.type === "paragraph" ? x.content.length : 0), 0),
    }),
  },
];