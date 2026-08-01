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

export function parseTextContent(text: string): ArticleSegment[] {
  const segments: ArticleSegment[] = [];
  const translationMarker = /^---\s*translation\s*---\s*$/im;

  // Split by the translation marker
  const parts = text.split(translationMarker);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Determine if this is a translation block based on position
    // First block before any marker is paragraph; blocks after markers are translations
    const isFirstPart = parts.indexOf(part) === 0;
    const hasPriorMarker = parts.slice(0, parts.indexOf(part)).some((p) =>
      translationMarker.test(p)
    );

    if (isFirstPart && parts.length === 1) {
      // No markers at all: split into paragraphs
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

export function countWords(text: string): number {
  // For English: count space-separated words
  // For Chinese: count characters
  const lang = detectLanguage(text);
  if (lang === "zh") {
    return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  }
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
