import type { Material } from "../types/material.ts";
import { defaultEnglishSentences } from "./defaultEnglishSentences.ts";
import { defaultChineseArticles } from "./defaultChineseArticles.ts";
import { defaultEnglishFables } from "./defaultEnglishFables.ts";

export const DEFAULT_MATERIALS_VERSION = "v3";

export interface DefaultMaterialDef {
  id: string;
  name: string;
  type: Material["type"];
  buildMaterial: () => Promise<Material>;
}

export const DEFAULT_MATERIALS: DefaultMaterialDef[] = [
 
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
