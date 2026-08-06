import type { ArticleSegment } from "../../types/material.ts";

export type DetectedLanguage = "en" | "zh" | "mixed";

export function detectLanguage(text: string): DetectedLanguage {
  const sample = text.slice(0, 500);
  const chineseChars = (sample.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const englishChars = (sample.match(/[a-zA-Z]/g) ?? []).length;

  if (chineseChars > englishChars * 2) return "zh";
  if (englishChars > chineseChars * 2) return "en";
  return "mixed";
}

function stripComments(text: string): string {
  return text
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");
}

export function parseTextContent(text: string): ArticleSegment[] {
  const cleanedText = stripComments(text);
  const segments: ArticleSegment[] = [];
  const translationMarker = /^---\s*translation\s*---\s*$/im;

  // Split by the translation marker
  const parts = cleanedText.split(translationMarker);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const isFirstPart = parts.indexOf(part) === 0;
    const hasPriorMarker = parts.slice(0, parts.indexOf(part)).some((p) =>
      translationMarker.test(p)
    );

    if (isFirstPart && parts.length === 1) {
      const paragraphs = trimmed.split(/\n{2,}/);
      for (const para of paragraphs) {
        const clean = para.trim();
        if (clean) {
          segments.push({ type: "paragraph", content: clean });
        }
      }
    } else if (!isFirstPart || hasPriorMarker) {
      segments.push({ type: "translation", content: trimmed });
    } else {
      const paragraphs = trimmed.split(/\n{2,}/);
      for (const para of paragraphs) {
        const clean = para.trim();
        if (clean) {
          segments.push({ type: "paragraph", content: clean });
        }
      }
    }
  }

  return segments;
}

/** Parse character-sequence practice files: strip # comments, group by empty lines,
 *  then split each block into paragraph-sized chunks of 5 lines each. */
export function parseCharSeqContent(text: string): ArticleSegment[] {
  const cleanedText = stripComments(text);

  // Split into blocks by empty lines
  const blocks = cleanedText.split(/\n{2,}/);

  const segments: ArticleSegment[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) continue;

    // Group 5 lines per paragraph, joined by space
    const CHUNK_SIZE = 5;
    for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
      const chunk = lines.slice(i, i + CHUNK_SIZE);
      segments.push({ type: "paragraph", content: chunk.join(" ") });
    }
  }

  return segments;
}

export function countWords(text: string): number {
  const lang = detectLanguage(text);
  if (lang === "zh") {
    return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  }
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
