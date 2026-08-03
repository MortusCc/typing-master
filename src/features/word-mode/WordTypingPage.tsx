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
  const [showRestore, setShowRestore] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [planSize, setPlanSize] = useState<number | null>(null);
  const [planStartIdx, setPlanStartIdx] = useState(0);
  const [customPlan, setCustomPlan] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { refresh(); }, [refresh]);
  const wordlists = materials.filter((m) => m.type === "wordlist");

  useEffect(() => {
    const saved = typing.restoreProgress("word");
    if (saved && saved.materialId) { setRestoreData(saved); setShowRestore(true); }
  }, []);

  const doRestore = useCallback(async () => {
    if (!restoreData) return;
    const mat: Material | undefined = await getMaterialById(restoreData.materialId);
    if (mat?.entries?.length) {
      setSelectedId(restoreData.materialId);
      setEntries(mat.entries);
      setCurrentIdx(restoreData.currentIdx);
      setErrorWords(restoreData.errorWords || []);
      setShowRestore(false);
      if (restoreData.planSize) setPlanSize(restoreData.planSize);
      if (restoreData.planStartIdx != null) setPlanStartIdx(restoreData.planStartIdx);
      const cur = mat.entries[restoreData.currentIdx];
      if (cur) typing.init(cur.english, restoreData.materialId, mat.name, "sequential");
      typing.restoreStats(restoreData);
    }
  }, [restoreData, typing]);

  const dismissRestore = () => { typing.clearProgress("word"); setShowRestore(false); };

  useEffect(() => {
    const materialId = searchParams.get("material");
    if (materialId && materialId !== selectedId) handleSelectMaterial(materialId);
  }, [searchParams, wordlists]);

  const handleSelectMaterial = useCallback(async (id: string) => {
    setSelectedId(id);
    const mat: Material | undefined = await getMaterialById(id);
    if (mat?.entries?.length) {
      setEntries(mat.entries);
      setCurrentIdx(0); setErrorWords([]); setShowResult(false); setSession(null); setFeedback(null);
      const savedPlan = localStorage.getItem("typing_plan_" + id);
      if (savedPlan) {
        try {
          const plan = JSON.parse(savedPlan);
          if (plan.planSize) setPlanSize(plan.planSize);
          const startIdx = plan.currentStartIdx || 0;
          setPlanStartIdx(startIdx);
          if (startIdx < mat.entries.length) {
            setCurrentIdx(startIdx);
            typing.init(mat.entries[startIdx].english, id, mat.name, "sequential");
            typing.saveProgress("word", { materialId: id, materialName: mat.name, currentIdx: startIdx, errorWords: [] });
            return;
          }
        } catch { /* ignore */ }
      }
      setShowPlanPicker(true);
    }
  }, [typing]);

  const startPlan = useCallback((n: number | null) => {
    const start = 0;
    setPlanSize(n); setPlanStartIdx(start); setCurrentIdx(start); setShowPlanPicker(false);
    localStorage.setItem("typing_plan_" + selectedId, JSON.stringify({ planSize: n, currentStartIdx: start }));
    typing.init(entries[start].english, selectedId, typing.materialName, "sequential");
    typing.saveProgress("word", { materialId: selectedId, materialName: typing.materialName, currentIdx: start, errorWords: [] });
  }, [selectedId, entries, typing]);

  const advance = useCallback(() => {
    const nextIdx = currentIdx + 1;
    const effectiveEnd = planSize != null ? Math.min(planStartIdx + planSize, entries.length) : entries.length;
    if (nextIdx >= effectiveEnd) {
      const s = typing.getSession();
      setSession(s); setShowResult(true);
      if (planSize != null && planStartIdx + planSize < entries.length) {
        const newStart = planStartIdx + planSize;
        localStorage.setItem("typing_plan_" + selectedId, JSON.stringify({ planSize, currentStartIdx: newStart }));
      } else {
        localStorage.removeItem("typing_plan_" + selectedId);
      }
      typing.clearProgress("word");
      return;
    }
    setCurrentIdx(nextIdx);
    typing.init(entries[nextIdx].english, selectedId, typing.materialName, "sequential");
    setErrorIndices(new Set());
    typing.saveProgress("word", { materialId: selectedId, materialName: typing.materialName, currentIdx: nextIdx, errorWords, planSize, planStartIdx });
  }, [currentIdx, entries, selectedId, typing, errorWords, planSize, planStartIdx]);

  const submitWord = useCallback(() => {
    if (typing.state !== "running") return;
    const isCorrect = typing.input.trim() === typing.target.trim();
    if (isCorrect) {
      setFeedback("correct");
      feedbackTimer.current = setTimeout(() => { setFeedback(null); advance(); }, 600);
    } else {
      setFeedback("error");
      const target = typing.target;
      setErrorWords((prev) => [...prev, { english: target, chinese: entries[currentIdx]?.chinese ?? "" }]);
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null); setErrorIndices(new Set());
        typing.init(target, selectedId, typing.materialName, "sequential");
      }, 1500);
    }
  }, [typing, advance, entries, currentIdx, selectedId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showResult) return;
      if (e.isComposing || e.key === "Dead") return;
      if (e.key === "Enter") { e.preventDefault(); submitWord(); return; }
      if (e.key === "Backspace") { e.preventDefault(); typing.handleBackspace(); return; }
      if (e.key.length === 1) {
        e.preventDefault();
        const newInput = typing.input + e.key;
        typing.handleKey(e.key);
        const inds = new Set<number>();
        for (let i = 0; i < Math.min(newInput.length, typing.target.length); i++) {
          if (newInput[i] !== typing.target[i]) inds.add(i);
        }
        setErrorIndices(inds);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [typing, submitWord, showResult]);

  useEffect(() => { return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }; }, []);

  const handleRestart = () => {
    if (!entries.length) return;
    setCurrentIdx(planStartIdx); setErrorWords([]); setShowResult(false); setSession(null); setFeedback(null);
    typing.init(entries[planStartIdx].english, selectedId, typing.materialName, "sequential");
  };
  const handleBack = () => { if (session) stats.recordSession(session); typing.reset(); navigate("/"); };
  const currentEntry = entries[currentIdx];

  return (
    <div className="space-y-4">
      {showRestore && restoreData && (
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-950">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">发现未完成的进度: {restoreData.materialName} (第 {restoreData.currentIdx + 1} 个词)</p>
          <div className="mt-2 flex gap-2"><Button size="sm" onClick={doRestore}>恢复</Button><Button size="sm" variant="ghost" onClick={dismissRestore}>放弃</Button></div>
        </div>
      )}

      {showPlanPicker && selectedId && (
        <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-6 text-center dark:border-indigo-950 dark:bg-indigo-900">
          <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">选择每次练习的词数</p>
          <div className="flex flex-wrap justify-center gap-2">
            {([20, 30, 50, 100] as const).map((n) => (
              <Button key={n} size="lg" onClick={() => startPlan(n)} className="min-w-[4.5rem] h-14 text-lg">{n}</Button>
            ))}
            <Button size="lg" onClick={() => startPlan(null)} className="min-w-[4.5rem] h-14 text-lg">全部</Button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <input type="number" min={1} max={entries.length} value={customPlan}
              onChange={(e) => setCustomPlan(e.target.value)}
              className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm dark:border-gray-600 dark:bg-gray-800" placeholder="自定义数量"
              onKeyDown={(e) => { if (e.key === "Enter") { const n = parseInt(customPlan, 10); if (n > 0 && n <= entries.length) startPlan(n); } }}
            />
            <Button size="sm" onClick={() => { const n = parseInt(customPlan, 10); if (n > 0 && n <= entries.length) startPlan(n); }}>确定</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">单词打字</h1>
        <select value={selectedId} onChange={(e) => handleSelectMaterial(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">选择素材...</option>
          {wordlists.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
        </select>
      </div>

      {!selectedId && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center dark:border-amber-800 dark:bg-amber-950">
          <p className="text-amber-700 dark:text-amber-300 text-lg font-semibold mb-2">请先选择打字素材</p>
          <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">在素材页面浏览并点击"练习"开始，或在此处下拉选择已有素材</p>
          <Link to="/materials"><Button variant="secondary">前往素材页</Button></Link>
        </div>
      )}

      {currentEntry && !showPlanPicker && (
        <>
          <StatsBar wpm={typing.wpm} current={currentIdx + (typing.state === "finished" ? 1 : 0)} total={planSize != null ? Math.min(planStartIdx + planSize, entries.length) : entries.length} backspaceCount={typing.backspaceCount} totalKeystrokes={typing.totalKeystrokes} />
          {feedback === "correct" && (<div className="rounded-lg bg-green-50 px-4 py-2 text-center text-green-700 dark:bg-green-950 dark:text-green-300">正确!</div>)}
          {feedback === "error" && (<div className="rounded-lg bg-red-50 px-4 py-2 text-center text-red-700 dark:bg-red-950 dark:text-red-300">错误! 正确答案: <span className="font-mono font-bold">{typing.target}</span></div>)}
          <WordCard chinese={currentEntry.chinese} phonetic={currentEntry.phonetic_uk ?? currentEntry.phonetic_us} target={typing.target} input={typing.input} cursor={typing.cursor} errorIndices={errorIndices} />
          <VirtualKeyboard nextKey={typing.nextKey} lastKeyResult={typing.lastKeyResult} />
        </>
      )}

      <WordResult open={showResult} session={session} errorWords={errorWords} onRestart={handleRestart} onBack={handleBack} />
    </div>
  );
}