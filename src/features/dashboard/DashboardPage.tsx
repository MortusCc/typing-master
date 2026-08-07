import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStatsStore } from "../../stores/statsStore.ts";
import { useMaterialStore } from "../../stores/materialStore.ts";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { recentSessions, loadRecent } = useStatsStore();
  const { materials, refresh: refreshMaterials } = useMaterialStore();
  const [tick, setTick] = useState(0);

  useEffect(() => { loadRecent(); }, [loadRecent]);
  useEffect(() => { refreshMaterials(); }, [refreshMaterials]);

  const today = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todays = recentSessions.filter(
      (s) => new Date(s.startedAt).toISOString().slice(0, 10) === todayStr,
    );
    if (!todays.length) return null;
    const avgWpm = Math.round(todays.reduce((a, s) => a + s.wpm, 0) / todays.length);
    const avgBks = Math.round(todays.reduce((a, s) => a + (s.totalKeystrokes > 0 ? s.backspaceCount / s.totalKeystrokes * 100 : 0), 0) / todays.length);
    const totalTime = todays.reduce((a, s) => a + s.duration, 0);
    const totalSec = Math.floor(totalTime / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const timeStr = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
    return { count: todays.length, avgWpm, avgBks, timeStr };
  }, [recentSessions]);

  const recentPractices = useMemo(() => {
    const seen = new Set<string>();
    return recentSessions
      .filter((s) => s.materialId && !seen.has(s.materialId) && seen.add(s.materialId))
      .slice(0, 4);
  }, [recentSessions]);

  // Enrich with plan progress from localStorage
  const enrichedPractices = useMemo(() => {
    const matMap = new Map(materials.map((m) => [m.id, m]));
    return recentPractices.map((s) => {
      const planStr = localStorage.getItem("typing_plan_" + s.materialId);
      let plan: { planSize: number | null; currentStartIdx: number } | null = null;
      if (planStr) { try { plan = JSON.parse(planStr); } catch { /* ignore */ } }
      const mat = matMap.get(s.materialId);
      const total = mat?.entries?.length ?? 0;
      const hasRemaining = plan && plan.currentStartIdx > 0 && plan.currentStartIdx < total;
      return { ...s, plan, total, hasRemaining };
    });
  }, [recentPractices, materials, tick]);

  const handleContinue = useCallback((materialId: string) => {
    navigate("/word?material=" + materialId + "&continue=1");
  }, [navigate]);

  const handleAbandon = useCallback((materialId: string) => {
    localStorage.removeItem("typing_plan_" + materialId);
    const progressStr = localStorage.getItem("typing_master_progress_word");
    if (progressStr) {
      try {
        const progress = JSON.parse(progressStr);
        if (progress.materialId === materialId) {
          localStorage.removeItem("typing_master_progress_word");
        }
      } catch { /* ignore */ }
    }
    setTick((n) => n + 1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">欢迎!</h1>

      {today ? (
        <div className="grid grid-cols-4 gap-3">
          <Card><p className="text-xl font-bold text-indigo-600">{today.count}</p><p className="text-xs text-gray-500">今日练习</p></Card>
          <Card><p className="text-xl font-bold text-green-600">{today.avgWpm}</p><p className="text-xs text-gray-500">平均 WPM</p></Card>
          <Card><p className="text-xl font-bold text-amber-600">{today.avgBks}%</p><p className="text-xs text-gray-500">退格率</p></Card>
          <Card><p className="text-xl font-bold text-blue-600">{today.timeStr}</p><p className="text-xs text-gray-500">今日时长</p></Card>
        </div>
      ) : (
        <Card><p className="text-center text-gray-400 py-6">今日尚未练习，开始打字吧!</p></Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button size="lg" onClick={() => navigate("/word")} className="h-24 text-lg">单词打字</Button>
        <Button size="lg" onClick={() => navigate("/article")} className="h-24 text-lg">文章打字</Button>
      </div>

      {enrichedPractices.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">最近练习</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enrichedPractices.map((p) => (
              <Card key={p.id}>
                <div>
                  <p className="font-medium text-sm">{p.materialName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.startedAt).toLocaleDateString("zh-CN")}  {p.wpm} WPM
                  </p>
                  {p.hasRemaining && p.plan ? (
                    <>
                      <p className="text-xs text-indigo-600 mt-1">
                        已练第 {p.plan.currentStartIdx}/{p.total} 词
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" onClick={() => handleContinue(p.materialId)}>继续</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAbandon(p.materialId)}>放弃</Button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="mt-2 cursor-pointer"
                      onClick={() => navigate("/word?material=" + p.materialId)}
                    >
                      <Button size="sm" variant="secondary">新练习</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
