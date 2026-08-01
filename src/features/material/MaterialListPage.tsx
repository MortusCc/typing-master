import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button.tsx";
import { ImportWizard } from "./ImportWizard.tsx";
import { MaterialCard } from "./MaterialCard.tsx";
import { useMaterialStore } from "../../stores/materialStore.ts";
import { deleteMaterial } from "../../services/db/repositories.ts";

export function MaterialListPage() {
  const { materials, loading, refresh } = useMaterialStore();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这个素材吗？此操作不可撤销。")) return;
    try {
      await deleteMaterial(id);
      await refresh();
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  const handleImported = async () => {
    await refresh();
  };

  const wordlistMaterials = materials.filter((m) => m.type === "wordlist");
  const articleMaterials = materials.filter(
    (m) => m.type === "article_en" || m.type === "article_zh",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          素材管理
        </h1>
        <Button onClick={() => setShowWizard(true)}>
          + 导入素材
        </Button>
      </div>

      {loading && materials.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p>加载中...</p>
        </div>
      )}

      {!loading && materials.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg mb-2">还没有素材</p>
          <p className="text-sm mb-4">
            点击「导入素材」添加单词表或文章
          </p>
          <Button variant="secondary" onClick={() => setShowWizard(true)}>
            导入第一个素材
          </Button>
        </div>
      )}

      {wordlistMaterials.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            📊 单词表
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wordlistMaterials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {articleMaterials.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            📝 文章
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articleMaterials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      <ImportWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onImported={handleImported}
      />
    </div>
  );
}
