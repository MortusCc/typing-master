import { Modal } from "../../components/ui/Modal.tsx";
import { Button } from "../../components/ui/Button.tsx";
import type { TypingSession } from "../../types/typing.ts";

interface WordResultProps {
  open: boolean;
  session: TypingSession | null;
  errorWords: { english: string; chinese: string }[];
  onRestart: () => void;
  onBack: () => void;
}

export function WordResult({ open, session, errorWords, onRestart, onBack }: WordResultProps) {
  if (!session) return null;

  const durationSec = Math.round(session.duration / 1000);
  const min = Math.floor(durationSec / 60);
  const sec = durationSec % 60;

  return (
      <Modal open={open} onClose={onBack} title="成绩单">
        <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
            <p className="text-2xl font-bold text-indigo-600">{session.wpm}</p>
            <p className="text-xs text-gray-500">速度</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
            <p className="text-2xl font-bold text-green-600">{session.accuracy}%</p>
            <p className="text-xs text-gray-500">正确率</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
            <p className="text-2xl font-bold text-amber-600">{min}:{sec.toString().padStart(2, "0")}</p>
            <p className="text-xs text-gray-500">用时</p>
          </div>
        </div>

        {errorWords.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              错误单词 ({errorWords.length})
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {errorWords.map((w, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-red-50 px-2 py-1 text-sm dark:bg-red-950">
                  <span className="font-mono text-red-600 dark:text-red-400">{w.english}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-600 dark:text-gray-400">{w.chinese}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onBack}>返回</Button>
          <Button onClick={onRestart}>再来一次</Button>
        </div>
      </div>
    </Modal>
  );
}