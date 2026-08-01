import { useState } from "react";
import { Button } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { Input } from "../../components/ui/Input.tsx";
import { detectLanguage, parseTextContent, countWords } from "../../services/parser/textParser.ts";
import type { ArticleSegment, Material, MaterialType } from "../../types/material.ts";
import { generateId, saveMaterial } from "../../services/db/repositories.ts";

interface TextImporterProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function TextImporter({ onComplete, onCancel }: TextImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [segments, setSegments] = useState<ArticleSegment[]>([]);
  const [detectedType, setDetectedType] = useState<MaterialType>("article_en");
  const [materialName, setMaterialName] = useState("");
  const [step, setStep] = useState<"upload" | "preview" | "confirm">("upload");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setLoading(true);

    try {
      const text = await f.text();
      setContent(text);
      const lang = detectLanguage(text);
      const parsed = parseTextContent(text);
      setSegments(parsed);

      let type: MaterialType = "article_en";
      if (lang === "zh") type = "article_zh";

      setDetectedType(type);
      setMaterialName(f.name.replace(/\.(txt|md)$/i, ""));
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件读取失败");
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
        type: detectedType,
        source: "user",
        sourceFile: file?.name ?? "",
        importedAt: Date.now(),
        segments,
        wordCount: countWords(content),
      };
      await saveMaterial(material);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = detectedType === "article_zh" ? "中文文章" : "英文文章";

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
              上传文本文件
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持 .txt 和 .md 格式。英文文章可用 ---translation--- 分隔翻译段落。
            </p>
            <input
              type="file"
              accept=".txt,.md,.text"
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

      {step === "preview" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              内容预览
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm">
                <span className="text-gray-500">检测类型：</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">
                  {typeLabel}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">字数：</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">
                  {countWords(content)}
                </span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                {content.slice(0, 2000)}
                {content.length > 2000 && "\n\n... (内容过长，已截断)"}
              </pre>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep("upload")}
            >
              重新选择
            </Button>
            <Button onClick={() => setStep("confirm")} disabled={loading}>
              继续
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
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <p>类型：{typeLabel}</p>
              <p>
                段落数：{segments.filter((s) => s.type === "paragraph").length}
              </p>
              <p>
                翻译段数：{segments.filter((s) => s.type === "translation").length}
              </p>
              <p>总字数：{countWords(content)}</p>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep("preview")}
            >
              返回预览
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
