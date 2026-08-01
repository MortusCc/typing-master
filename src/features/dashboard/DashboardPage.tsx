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
    const avgAcc = Math.round(todays.reduce((a, s) => a + s.accuracy, 0) / todays.length);
    const totalTime = todays.reduce((a, s) => a + s.duration, 0);
    return {
      count: todays.length,
      avgWpm,
      avgAcc,
      mins: Math.floor(totalTime / 60000),
    };
  }, [recentSessions]);

  const recentMaterials = useMemo(
    () => materials.slice(0, 4),
    [materials],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome!</h1>

      {today ? (
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <p className="text-xl font-bold text-indigo-600">{today.count}</p>
            <p className="text-xs text-gray-500">Today Sessions</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-green-600">{today.avgWpm}</p>
            <p className="text-xs text-gray-500">Avg WPM</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-amber-600">{today.avgAcc}%</p>
            <p className="text-xs text-gray-500">Avg Accuracy</p>
          </Card>
          <Card>
            <p className="text-xl font-bold text-blue-600">{today.mins}m</p>
            <p className="text-xs text-gray-500">Time Today</p>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-400 py-6">No practice today. Start typing!</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button size="lg" onClick={() => navigate("/word")} className="h-24 text-lg">
          Word Typing
        </Button>
        <Button size="lg" onClick={() => navigate("/article")} className="h-24 text-lg">
          Article Typing
        </Button>
      </div>

      {recentMaterials.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">Recent Materials</h2>
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
                    {m.wordCount != null ? `${m.wordCount} chars` : "—"}
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