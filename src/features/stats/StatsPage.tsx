import { Card } from "../../components/ui/Card.tsx";

export function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        统计与历史
      </h1>
      <Card>
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg mb-2">Phase 4 — 即将实现</p>
          <p className="text-sm">
            完成后将展示打字速度趋势图与历史记录
          </p>
        </div>
      </Card>
    </div>
  );
}
