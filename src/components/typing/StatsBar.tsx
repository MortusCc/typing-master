import { Progress } from "../ui/Progress.tsx";

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  current: number;
  total: number;
  backspaceCount?: number;
  totalKeystrokes?: number;
}

export function StatsBar({ wpm, accuracy, current, total, backspaceCount, totalKeystrokes }: StatsBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
      <Progress value={pct} />
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{current} / {total}</span>
        <span>{pct}%</span>
        <span>{wpm} WPM</span>
        <span>{accuracy}%</span>
        {backspaceCount != null && totalKeystrokes != null && (
          <span>退格 {backspaceCount}/{totalKeystrokes}</span>
        )}
      </div>
    </div>
  );
}