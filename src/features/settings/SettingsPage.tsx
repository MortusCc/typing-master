import { Card } from "../../components/ui/Card.tsx";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        设置
      </h1>
      <Card>
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg mb-2">Phase 5 — 即将实现</p>
          <p className="text-sm">
            完成后将支持主题切换、字体调节、数据导出等功能
          </p>
        </div>
      </Card>
    </div>
  );
}
