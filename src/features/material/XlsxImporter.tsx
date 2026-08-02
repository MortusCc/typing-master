import { useState } from "react";
import { Button } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { Select } from "../../components/ui/Select.tsx";
import { Input } from "../../components/ui/Input.tsx";
import { parseXlsxFile, extractWordEntries } from "../../services/parser/xlsxParser.ts";
import type { WordEntry, Material } from "../../types/material.ts";
import { generateId, saveMaterial } from "../../services/db/repositories.ts";

interface XlsxImporterProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function XlsxImporter({ onComplete, onCancel }: XlsxImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [englishCol, setEnglishCol] = useState<number>(1);
  const [chineseCol, setChineseCol] = useState<number>(4);
  const [phoneticUkCol, setPhoneticUkCol] = useState<number>(-1);
  const [phoneticUsCol, setPhoneticUsCol] = useState<number>(-1);
  const [materialName, setMaterialName] = useState("");
  const [step, setStep] = useState<"upload" | "mapping" | "confirm">("upload");
  const [entries, setEntries] = useState<WordEntry[]>([]);
  const [error, setError] = useState("");
  const [startRow, setStartRow] = useState(2);
  const [endRow, setEndRow] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setLoading(true);
    try {
      const preview = await parseXlsxFile(f);
      setHeaders(preview.headers);
      setPreviewRows(preview.rows);
      setMaterialName(f.name.replace(/\.xlsx?$/i, ""));
      setStep("mapping");
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件解析失败");
    } finally {
      setLoading(false);
    }
  };

  const handleMapping = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Re-parse full data
      const data = await new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(new Uint8Array(e.target!.result as ArrayBuffer));
        reader.onerror = () => reject(new Error("读取失败"));
        reader.readAsArrayBuffer(file);
      });

      const XLSX = await import("xlsx");
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
      // Skip rows before startRow
      const fullData = rawData.slice(startRow) as string[][];

      const extracted = extractWordEntries(
        fullData,
        englishCol,
        chineseCol,
        phoneticUkCol >= 0 ? phoneticUkCol : undefined,
        phoneticUsCol >= 0 ? phoneticUsCol : undefined,
        endRow > 0 ? endRow : undefined,
      );
      setEntries(extracted);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const material: Material = {
        id: generateId(),
        name: materialName || file?.name || "未命名素材",
        type: "wordlist",
        source: "user",
        sourceFile: file?.name ?? "",
        importedAt: Date.now(),
        entries,
        wordCount: entries.length,
      };
      await saveMaterial(material);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setLoading(false);
    }
  };

  const headerOptions = headers.map((h, i) => ({
    value: String(i),
    label: `列${i + 1}: ${h || "(空)"}`,
  }));

  const skipOption = { value: "-1", label: "不导入" };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === "upload" && (
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              上传 Excel 文件
            </h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
            />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onCancel}>
                取消
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === "mapping" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              列映射
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label={`起始行（${startRow}）`} type="number" min={0} value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} />
              <Input label={`结束行（${endRow > 0 ? endRow : '不限'}）`} type="number" min={0} placeholder="0=全部" value={endRow} onChange={(e) => setEndRow(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="英文/单词列"
                options={headerOptions}
                value={String(englishCol)}
                onChange={(e) => setEnglishCol(Number(e.target.value))}
              />
              <Select
                label="中文/翻译列"
                options={headerOptions}
                value={String(chineseCol)}
                onChange={(e) => setChineseCol(Number(e.target.value))}
              />
              <Select
                label="英式音标列（可选）"
                options={[skipOption, ...headerOptions]}
                value={String(phoneticUkCol)}
                onChange={(e) => setPhoneticUkCol(Number(e.target.value))}
              />
              <Select
                label="美式音标列（可选）"
                options={[skipOption, ...headerOptions]}
                value={String(phoneticUsCol)}
                onChange={(e) => setPhoneticUsCol(Number(e.target.value))}
              />
            </div>
          </Card>

          {/* Preview */}
          {previewRows.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                数据预览（前5行）
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium"
                        >
                          {h || `列${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2 text-gray-700 dark:text-gray-300"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep("upload")}
            >
              重新选择
            </Button>
            <Button onClick={handleMapping} disabled={loading}>
              {loading ? "解析中..." : "确认映射"}
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              确认导入
            </h3>
            <Input
              label="素材名称"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              共解析出 {entries.length} 个单词
            </p>
            {entries.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
                      <th className="px-3 py-2 text-left text-gray-500">英文</th>
                      <th className="px-3 py-2 text-left text-gray-500">中文</th>
                      <th className="px-3 py-2 text-left text-gray-500">音标(英)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.slice(0, 10).map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="px-3 py-1.5 text-gray-900 dark:text-gray-100">
                          {entry.english}
                        </td>
                        <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                          {entry.chinese}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                          {entry.phonetic_uk ?? "-"}
                        </td>
                      </tr>
                    ))}
                    {entries.length > 10 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-2 text-center text-gray-400"
                        >
                          ... 还有 {entries.length - 10} 条
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep("mapping")}
            >
              返回修改
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              {loading ? "导入中..." : "确认导入"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
