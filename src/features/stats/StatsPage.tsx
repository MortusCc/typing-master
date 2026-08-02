import { useEffect, useMemo } from "react";
import { useStatsStore } from "../../stores/statsStore.ts";
import { Card } from "../../components/ui/Card.tsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StatsPage() {
  const { recentSessions, loading, loadRecent } = useStatsStore();

  useEffect(() => { loadRecent(); }, [loadRecent]);

  // Overview stats
  const overview = useMemo(() => {
    if (!recentSessions.length) return null;
    const total = recentSessions.length;
    const avgWpm = Math.round(recentSessions.reduce((s, x) => s + x.wpm, 0) / total);
    const avgBks = Math.round(recentSessions.reduce((s, x) => s + (x.totalKeystrokes > 0 ? x.backspaceCount / x.totalKeystrokes * 100 : 0), 0) / total);
    const totalTime = recentSessions.reduce((s, x) => s + x.duration, 0);
    const mins = Math.floor(totalTime / 60000);
    return { total, avgWpm, avgAcc, mins };
  }, [recentSessions]);

  // Trend data (last 14 days)
  const trend = useMemo(() => {
    const map = new Map<string, { wpm: number; acc: number; count: number }>();
    for (const s of recentSessions) {
      const d = new Date(s.startedAt).toISOString().slice(0, 10);
      const e = map.get(d) ?? { wpm: 0, acc: 0, count: 0 };
      e.wpm += s.wpm;
      e.acc += (s.totalKeystrokes > 0 ? s.backspaceCount / s.totalKeystrokes * 100 : 0);
      e.count++;
      map.set(d, e);
    }
    return [...map.entries()]
      .map(([date, v]) => ({
        date: date.slice(5),
        WPM: Math.round(v.wpm / v.count),
        Backspaces: Math.round(v.acc / v.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [recentSessions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">统计</h1>

      {loading && <p className="text-gray-400">加载中...</p>}

      {!loading && !overview && (
        <div className="py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">暂无数据</p>
          <p>还没有练习记录，开始打字吧!</p>
        </div>
      )}

      {overview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <p className="text-2xl font-bold text-indigo-600">{overview.total}</p>
              <p className="text-xs text-gray-500">总次数</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-green-600">{overview.avgWpm}</p>
              <p className="text-xs text-gray-500">平均速度</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-amber-600">{overview.avgAcc}%</p>
              <p className="text-xs text-gray-500">退格率</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-blue-600">{overview.mins}m</p>
              <p className="text-xs text-gray-500">总时长</p>
            </Card>
          </div>

          {trend.length > 1 && (
            <Card>
              <h2 className="mb-3 font-semibold text-sm text-gray-500">趋势 (近14天)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis yAxisId="wpm" fontSize={12} />
                  <YAxis yAxisId="acc" orientation="right" domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Line yAxisId="wpm" type="monotone" dataKey="WPM" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="acc" type="monotone" dataKey="Backspaces" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-gray-500">最近记录</h2>
            {recentSessions.slice(0, 20).map((s) => (
              <Card key={s.id} hover>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{s.materialName}</span>
                    <span className="ml-2 text-gray-400">
                      {new Date(s.startedAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{s.wpm} WPM</span>
                    <span>{Math.round(s.totalKeystrokes > 0 ? s.backspaceCount / s.totalKeystrokes * 100 : 0)}%</span>
                    <span>{Math.round(s.duration / 1000)}s</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}