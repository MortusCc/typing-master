import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStatsStore } from "../../stores/statsStore.ts";
import { useMaterialStore } from "../../stores/materialStore.ts";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { recentSessions, loadRecent } = useStatsStore();
  const { materials, refresh } = useMaterialStore();

  useEffect(() => { loadRecent(); refresh(); }, [loadRecent, refresh]);

  const today = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todays = recentSessions.filter(
      (s) => new Date(s.startedAt).toISOString().slice(0, 10) === todayStr,
    );
    if (!todays.length) return null;
    const avgWpm = Math.round(todays.reduce((a, s) => a + s.wpm, 0) / todays.length);
    const avgBks = Math.round(todays.reduce((a, s) => a + (s.totalKeystrokes > 0 ? s.backspaceCount / s.totalKeystrokes * 100 : 0), 0) / todays.length);
    const totalTime = todays.reduce((a, s) => a + s.duration, 0);
    return {
      count: todays.length,
      avgWpm,
      avgBks,
      mins: Math.floor(totalTime / 60000),
    };
  }, [recentSessions]);

  const recentMaterials = useMemo(
    () => materials.slice(0, 4),
    [materials],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">欢迎!</h1>

      {today ? (
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <p className="text-xl font-bold text-indigo-600">{today.count}</p>
            <p className="text-xs text-gray-500">今日练习</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-green-600">{today.avgWpm}</p>
            <p className="text-xs text-gray-500">平均速度</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-amber-600">{today.avgBks}%%</p>
            <p className="text-xs text-gray-500">退格率</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-blue-600">{today.mins}m</p>
            <p className="text-xs text-gray-500">今日时长</p>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-400 py-6">今日尚未练习，开始打字吧!</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button size="lg" onClick={() => navigate("/word")} className="h-24 text-lg">
          单词打字
        </Button>
        <Button size="lg" onClick={() => navigate("/article")} className="h-24 text-lg">
          文章打字
        </Button>
      </div>

      {recentMaterials.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">最近素材</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentMaterials.map((m) => (
              <Card key={m.id} hover>
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(m.type === "wordlist" ? "/word" : "/article")}
                >
                  <p className="font-medium text-sm">
                    {m.type === "wordlist" ? "Word" : "Article"} {m.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {m.wordCount != null ? `${m.wordCount} 字` : "—"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}