import * as XLSX from "xlsx";
import type { WordEntry } from "../../types/material.ts";

export interface XlsxPreview {
  headers: string[];
  rows: string[][];
  sheetName: string;
  totalRows: number;
}

export function parseXlsxFile(file: File): Promise<XlsxPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });

        if (json.length === 0) {
          reject(new Error("文件为空"));
          return;
        }

        const headers = (json[0] as string[]).map((h) => String(h));
        // preview: first 5 data rows (skip header)
        const rows = json.slice(1, 6).map((row) =>
          (row as string[]).map((cell) => String(cell))
        );

        resolve({
          headers,
          rows,
          sheetName,
          totalRows: json.length - 1,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

export function extractWordEntries(
  jsonData: string[][],
  englishCol: number,
  chineseCol: number,
  phoneticUkCol?: number,
  phoneticUsCol?: number,
): WordEntry[] {
  // Skip header row (index 0)
  const dataRows = jsonData.slice(1);

  return dataRows
    .filter((row) => {
      const en = String(row[englishCol] ?? "").trim();
      return en.length > 0 && !/^Unit\s*\d/i.test(en) && en !== "None";
    })
    .map((row, idx) => {
      const entry: WordEntry = {
        id: idx + 1,
        english: String(row[englishCol] ?? "").trim(),
        chinese: String(row[chineseCol] ?? "").trim(),
      };
      if (phoneticUkCol !== undefined && phoneticUkCol >= 0) {
        entry.phonetic_uk = String(row[phoneticUkCol] ?? "").trim();
      }
      if (phoneticUsCol !== undefined && phoneticUsCol >= 0) {
        entry.phonetic_us = String(row[phoneticUsCol] ?? "").trim();
      }
      return entry;
    });
}
