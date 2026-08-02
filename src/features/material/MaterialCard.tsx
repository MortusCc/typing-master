import type { Material, MaterialType } from "../../types/material.ts";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { useNavigate } from "react-router-dom";

interface MaterialCardProps {
  material: Material;
  onDelete: (id: string) => void;
}

const typeIcons: Record<MaterialType, string> = {
  wordlist: "🔤",
  article_en: "🇬🇧",
  article_zh: "🇨🇳",
};

const typeLabels: Record<MaterialType, string> = {
  wordlist: "单词表",
  article_en: "英文文章",
  article_zh: "中文文章",
};

function getItemCount(material: Material): number {
  if (material.entries) return material.entries.length;
  if (material.wordCount !== undefined) return material.wordCount;
  return 0;
}

export function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const navigate = useNavigate();
  const isBuiltin = material.source === "builtin";
  const itemCount = getItemCount(material);
  const targetPath = material.type === "wordlist" ? "/word" : "/article";

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcons[material.type]}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {material.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {typeLabels[material.type]}
              </span>
              {isBuiltin && (
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  内置
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>
          {material.type === "wordlist" ? `${itemCount} 个单词` : `${itemCount} 词`}
        </span>
        <span>·</span>
        <span>
          {new Date(material.importedAt).toLocaleDateString("zh-CN")}
        </span>
        <span>·</span>
        <span className="text-xs">
          {material.source === "builtin" ? "内置" : "用户导入"}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Button
          size="sm"
          onClick={() => navigate(`${targetPath}?material=${material.id}`)}
        >
          练习
        </Button>
        {!isBuiltin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(material.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            删除
          </Button>
        )}
      </div>
    </Card>
  );
}
