import type { Material } from "../types/material.ts";
import { defaultEnglishSentences } from "./defaultEnglishSentences.ts";
import { defaultChineseArticles } from "./defaultChineseArticles.ts";
import { defaultEnglishFables } from "./defaultEnglishFables.ts";

export const DEFAULT_MATERIALS_VERSION = "v1";

export interface DefaultMaterialDef {
  id: string;
  name: string;
  type: Material["type"];
  buildMaterial: () => Promise<Material>;
}

export const DEFAULT_MATERIALS: DefaultMaterialDef[] = [
  {
    id: "builtin-xlsx-wordlist",
    name: "小学英语四年级下",
    type: "wordlist",
    buildMaterial: async () => {
      const resp = await fetch(
        import.meta.env.BASE_URL + "default-materials/" + encodeURIComponent("小学英语单词音标表.xlsx"),
      );
      if (!resp.ok) {
        return {
          id: "builtin-xlsx-wordlist",
          name: "小学英语四年级下",
          type: "wordlist" as const,
          source: "builtin" as const,
          sourceFile: "default-materials/小学英语单词音标表.xlsx",
          importedAt: Date.now(),
          entries: [],
          wordCount: 0,
        };
      }
      const buffer = await resp.arrayBuffer();
      const { read, utils } = await import("xlsx");
      const wb = read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: unknown[][] = utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });
      const entries: Material["entries"] = [];
      let id = 0;
      for (let i = 3; i < rows.length; i++) {
        const row = rows[i];
        const en = String(row[1] ?? "").trim();
        const zh = String(row[4] ?? "").trim();
        if (!en && !zh) continue;
        if (/^(Unit\s*\d+|第\s*\d+\s*单元?|单元?\s*\d+)$/i.test(en)) continue;
        id++;
        entries.push({
          id,
          english: en,
          chinese: zh,
          phonetic_uk: String(row[2] ?? "").trim() || undefined,
          phonetic_us: String(row[3] ?? "").trim() || undefined,
        });
      }
      return {
        id: "builtin-xlsx-wordlist",
        name: "小学英语四年级下",
        type: "wordlist",
        source: "builtin",
        sourceFile: "default-materials/小学英语单词音标表.xlsx",
        importedAt: Date.now(),
        entries,
        wordCount: entries.length,
      };
    },
  },
  {
    id: "builtin-en-sentences",
    name: "英文短句练习",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-sentences",
      name: "英文短句练习",
      type: "article_en",
      source: "builtin",
      sourceFile: "builtin",
      importedAt: Date.now(),
      segments: defaultEnglishSentences,
      wordCount: defaultEnglishSentences.reduce(
        (sum, s) => sum + (s.type === "paragraph" ? s.content.split(/\s+/).length : 0),
        0,
      ),
    }),
  },
  {
    id: "builtin-zh-articles",
    name: "中文段落练习",
    type: "article_zh",
    buildMaterial: async () => ({
      id: "builtin-zh-articles",
      name: "中文段落练习",
      type: "article_zh",
      source: "builtin",
      sourceFile: "builtin",
      importedAt: Date.now(),
      segments: defaultChineseArticles,
      wordCount: defaultChineseArticles.reduce(
        (sum, s) => sum + (s.type === "paragraph" ? s.content.length : 0),
        0,
      ),
    }),
  },
  {
    id: "builtin-en-fables",
    name: "英文寓言三则",
    type: "article_en",
    buildMaterial: async () => ({
      id: "builtin-en-fables",
      name: "英文寓言三则",
      type: "article_en",
      source: "builtin",
      sourceFile: "builtin",
      importedAt: Date.now(),
      segments: defaultEnglishFables,
      wordCount: defaultEnglishFables.reduce(
        (sum, s) => sum + (s.type === "paragraph" ? s.content.split(/\s+/).length : 0),
        0,
      ),
    }),
  },
];
