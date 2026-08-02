import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { VirtualKeyboard } from "../../components/typing/VirtualKeyboard.tsx";
import { StatsBar } from "../../components/typing/StatsBar.tsx";
import { WordCard } from "./WordCard.tsx";
import { WordResult } from "./WordResult.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { useMaterialStore } from "../../stores/materialStore.ts";
import { useTypingStore } from "../../stores/typingStore.ts";
import { useStatsStore } from "../../stores/statsStore.ts";
import { getMaterialById } from "../../services/db/repositories.ts";
import type { Material, WordEntry } from "../../types/material.ts";
import type { TypingSession } from "../../types/typing.ts";

export default function WordTypingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { materials, refresh } = useMaterialStore();
  const typing = useTypingStore();
  const stats = useStatsStore();

  const [selectedId, setSelectedId] = useState<string>("");
  const [entries, setEntries] = useState<WordEntry[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [errorWords, setErrorWords] = useState<{ english: string; chinese: string }[]>([]);
  const [session, setSession] = useState<TypingSession | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "error" | null>(null);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { refresh(); }, [refresh]);

  const wordlists = materials.filter((m) => m.type === "wordlist");

  // Auto-select material from URL parameter
  useEffect(() => {
    const materialId = searchParams.get("material");
    if (materialId && materialId !== selectedId) {
      handleSelectMaterial(materialId);
    }
  }, [searchParams, wordlists]);

  const handleSelectMaterial = useCallback(async (id: string) => {
    setSelectedId(id);
    const mat: Material | undefined = await getMaterialById(id);
    if (mat?.entries?.length) {
      setEntries(mat.entries);
      setCurrentIdx(0);
      setErrorWords([]);
      setShowResult(false);
      setSession(null);
      setFeedback(null);
      const first = mat.entries[0];
      typing.init(first.english, id, mat.name, "sequential");
    }
  }, [typing]);

  const advance = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= entries.length) {
      const s = typing.getSession();
      setSession(s);
      setShowResult(true);
      return;
    }
    setCurrentIdx(nextIdx);
    typing.init(entries[nextIdx].english, selectedId, typing.materialName, "sequential");
    setErrorIndices(new Set());
  }, [currentIdx, entries, selectedId, typing]);

  const submitWord = useCallback(() => {
    if (typing.state !== "running") return;
    const isCorrect = typing.input.trim() === typing.target.trim();
    if (isCorrect) {
      setFeedback("correct");
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        advance();
      }, 600);
    } else {
      setFeedback("error");
      const idx = new Set<number>();
      for (let i = 0; i < Math.min(typing.input.length, typing.target.length); i++) {
        if (typing.input[i] !== typing.target[i]) idx.add(i);
      }
      setErrorIndices(idx);
      setErrorWords((prev) => [
        ...prev,
        { english: typing.target, chinese: entries[currentIdx]?.chinese ?? "" },
      ]);
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        advance();
      }, 1500);
    }
  }, [typing, advance, entries, currentIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showResult) return;
      if (e.isComposing || e.key === "Dead") return;
      if (e.key === "Enter") {
        e.preventDefault();
        submitWord();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        typing.handleBackspace();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        typing.handleKey(e.key);
        // Real-time error tracking
        const newInput = typing.input + e.key;
        const newIndices = new Set<number>();
        for (let i = 0; i < Math.min(newInput.length, typing.target.length); i++) {
          if (newInput[i] !== typing.target[i]) newIndices.add(i);
        }
        setErrorIndices(newIndices);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [typing, submitWord, showResult]);

  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, []);

  const handleRestart = () => {
    if (!entries.length) return;
    setCurrentIdx(0);
    setErrorWords([]);
    setShowResult(false);
    setSession(null);
    setFeedback(null);
    typing.init(entries[0].english, selectedId, typing.materialName, "sequential");
  };

  const handleBack = () => {
    if (session) stats.recordSession(session);
    typing.reset();
    navigate("/");
  };

  const currentEntry = entries[currentIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">单词打字</h1>
        <select
          value={selectedId}
          onChange={(e) => handleSelectMaterial(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">选择素材...</option>
          {wordlists.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {!selectedId && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center dark:border-amber-800 dark:bg-amber-950">
          <p className="text-amber-700 dark:text-amber-300 text-lg font-semibold mb-2">请先选择打字素材</p>
          <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">在素材页面浏览并点击"练习"开始，或在此处下拉选择已有素材</p>
          <Link to="/materials">
            <Button variant="secondary">前往素材页</Button>
          </Link>
        </div>
      )}

      {currentEntry && (
        <>
          <StatsBar
            wpm={typing.wpm}
            accuracy={typing.accuracy}
            current={currentIdx + (typing.state === "finished" ? 1 : 0)}
            total={entries.length}
          />

          {feedback === "correct" && (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-center text-green-700 dark:bg-green-950 dark:text-green-300">正确!</div>
          )}
          {feedback === "error" && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-center text-red-700 dark:bg-red-950 dark:text-red-300">
              错误! 正确答案: <span className="font-mono font-bold">{typing.target}</span>
            </div>
          )}

          <WordCard
            chinese={currentEntry.chinese}
            phonetic={currentEntry.phonetic_uk ?? currentEntry.phonetic_us}
            target={typing.target}
            input={typing.input}
            cursor={typing.cursor}
            errorIndices={errorIndices}
          />

          <VirtualKeyboard nextKey={typing.nextKey} lastKeyResult={typing.lastKeyResult} />
        </>
      )}

      <WordResult
        open={showResult}
        session={session}
        errorWords={errorWords}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    </div>
  );
}