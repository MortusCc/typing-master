import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { VirtualKeyboard } from "../../components/typing/VirtualKeyboard.tsx";
import { StatsBar } from "../../components/typing/StatsBar.tsx";
import { ArticleView } from "./ArticleView.tsx";
import { Modal } from "../../components/ui/Modal.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { useMaterialStore } from "../../stores/materialStore.ts";
import { useTypingStore } from "../../stores/typingStore.ts";
import { getMaterialById } from "../../services/db/repositories.ts";
import type { Material } from "../../types/material.ts";
import type { TypingSession } from "../../types/typing.ts";

const getTypingState = useTypingStore.getState;

export default function ArticleTypingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { materials, refresh } = useMaterialStore();
  const typing = useTypingStore();

  const [selectedId, setSelectedId] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [translations, setTranslations] = useState<(string | undefined)[]>([]);
  const [paraIdx, setParaIdx] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [doneChars, setDoneChars] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [session, setSession] = useState<TypingSession | null>(null);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [shiftDown, setShiftDown] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const errorIndicesRef = useRef<Set<number>>(new Set());
  useEffect(() => { errorIndicesRef.current = errorIndices; }, [errorIndices]);

  useEffect(() => { refresh(); }, [refresh]);
  const articles = materials.filter((m) => m.type === "article_en" || m.type === "article_zh");

  // Check for unsaved progress on mount
  useEffect(() => {
    if (searchParams.get("continue") === "1") return;
    const saved = typing.restoreProgress("article");
    if (saved && saved.materialId) { setRestoreData(saved); setShowRestore(true); }
  }, []);

  // Auto-select material from URL parameter
  useEffect(() => {
    const materialId = searchParams.get("material");
    if (materialId && materialId !== selectedId) handleSelect(materialId);
  }, [searchParams, articles]);

  const handleSelect = useCallback(async (id: string) => {
    setSelectedId(id);
    const mat: Material | undefined = await getMaterialById(id);
    if (!mat?.segments) return;
    const paras: string[] = [];
    const trans: (string | undefined)[] = [];
    let cur: string | undefined;
    for (const seg of mat.segments) {
      if (seg.type === "paragraph") { paras.push(seg.content); trans.push(cur); cur = undefined; }
      else if (seg.type === "translation") { cur = seg.content; }
    }
    const total = paras.reduce((s, p) => s + p.length, 0);
    setParagraphs(paras); setTranslations(trans); setParaIdx(0);
    setTotalChars(total); setDoneChars(0);
    setShowResult(false); setSession(null);
    if (paras.length > 0) { typing.resetStats(); typing.init(paras[0], id, mat.name, "sequential"); }
    typing.saveProgress("article", { materialId: id, materialName: mat.name, paraIdx: 0, doneChars: 0 });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [typing]);

  const doRestore = useCallback(async () => {
    if (!restoreData) return;
    const mat: Material | undefined = await getMaterialById(restoreData.materialId);
    if (!mat?.segments) return;
    const paras: string[] = [];
    const trans: (string | undefined)[] = [];
    let cur: string | undefined;
    for (const seg of mat.segments) {
      if (seg.type === "paragraph") { paras.push(seg.content); trans.push(cur); cur = undefined; }
      else if (seg.type === "translation") { cur = seg.content; }
    }
    const total = paras.reduce((s, p) => s + p.length, 0);
    const pIdx = restoreData.paraIdx ?? 0;
    const dChars = restoreData.doneChars ?? 0;
    setSelectedId(restoreData.materialId);
    setParagraphs(paras); setTranslations(trans); setParaIdx(pIdx);
    setTotalChars(total); setDoneChars(dChars);
    setShowRestore(false);
    if (paras.length > pIdx) { typing.resetStats(); typing.init(paras[pIdx], restoreData.materialId, mat.name, "sequential"); }
    typing.restoreStats(restoreData);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [restoreData, typing]);

  const dismissRestore = () => { typing.clearProgress("article"); setShowRestore(false); };

  const advance = useCallback(() => {
    const next = paraIdx + 1;
    if (next >= paragraphs.length) {
      const s = typing.getSession(); setSession(s); setShowResult(true);
      typing.clearProgress("article");
      return;
    }
    const newDoneChars = doneChars + paragraphs[paraIdx].length;
    setDoneChars(newDoneChars);
    setParaIdx(next);
    typing.init(paragraphs[next], selectedId, typing.materialName, "sequential");
    typing.saveProgress("article", { materialId: selectedId, materialName: typing.materialName, paraIdx: next, doneChars: newDoneChars });
    setErrorIndices(new Set());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [paraIdx, paragraphs, selectedId, typing, doneChars]);

  const updateErrors = () => {
    const st = getTypingState();
    const inds = new Set<number>();
    for (let i = 0; i < st.input.length; i++) {
      if (i >= st.target.length || st.input[i] !== st.target[i]) inds.add(i);
    }
    setErrorIndices(inds);
  };

  useEffect(() => {
    const el = inputRef.current; if (!el) return;
    const cs = () => { composingRef.current = true; };
    const ce = (e: CompositionEvent) => {
      composingRef.current = false;
      for (const ch of (e.data ?? "")) getTypingState().handleKey(ch);
      el.value = "";
      updateErrors();
    };
    el.addEventListener("compositionstart", cs);
    el.addEventListener("compositionend", ce);
    setTimeout(() => el.focus(), 50);
    return () => { el.removeEventListener("compositionstart", cs); el.removeEventListener("compositionend", ce); };
  }, [paraIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Shift") { setShiftDown(true); return; }
      if (e.key === "CapsLock") { setCapsOn(e.getModifierState?.("CapsLock") ?? false); return; }
      if (composingRef.current) return;
      if (e.key === "Backspace") { e.preventDefault(); getTypingState().handleBackspace(); updateErrors(); return; }
      if (e.key.length === 1) { e.preventDefault(); getTypingState().handleKey(e.key); updateErrors(); return; }
      if (e.key === "Enter") {
        const st = getTypingState();
        if (st.input.length >= st.target.length && st.target.length > 0 && errorIndicesRef.current.size === 0) advance();
        return;
      }
    };
    const keyup = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftDown(false); };
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", keyup);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("keyup", keyup); };
  }, [showResult, advance]);

  const handleRestart = () => {
    if (!paragraphs.length) return;
    setParaIdx(0); setDoneChars(0); setShowResult(false); setSession(null);
    typing.init(paragraphs[0], selectedId, typing.materialName, "sequential");
    typing.saveProgress("article", { materialId: selectedId, materialName: typing.materialName, paraIdx: 0, doneChars: 0 });
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const handleBack = () => { typing.reset(); navigate("/"); };
  const cur = paragraphs[paraIdx] ?? "";

  return (
    <div className="space-y-4">
      <input ref={inputRef} className="absolute opacity-0 w-0 h-0" autoComplete="off" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">文章打字</h1>
        <select value={selectedId} onChange={(e) => handleSelect(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">选择素材...</option>
          {articles.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
        </select>
      </div>

      {showRestore && restoreData && (
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-950">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
            发现未完成的进度: {restoreData.materialName}（第 {restoreData.paraIdx + 1} 段，已完成 {restoreData.doneChars} 字符）
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={doRestore}>恢复</Button>
            <Button size="sm" variant="ghost" onClick={dismissRestore}>放弃</Button>
          </div>
        </div>
      )}

      {!selectedId && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center dark:border-amber-800 dark:bg-amber-950">
          <p className="text-amber-700 dark:text-amber-300 text-lg font-semibold mb-2">请先选择打字素材</p>
          <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">在素材页面浏览并点击"练习"开始，或在此处下拉选择已有素材</p>
          <Link to="/materials">
            <Button variant="secondary">前往素材页</Button>
          </Link>
        </div>
      )}

      {cur && (<>
        <StatsBar wpm={typing.wpm} accuracy={typing.accuracy} current={doneChars + typing.cursor} total={totalChars} backspaceCount={typing.backspaceCount} totalKeystrokes={typing.totalKeystrokes} />
        <ArticleView paragraph={cur} translation={translations[paraIdx]} input={typing.input} cursor={typing.cursor} errorIndices={errorIndices} paragraphIndex={paraIdx} totalParagraphs={paragraphs.length} composing={false} />
        <div className="text-center text-xs text-gray-400">按 Enter 进入下一段</div>
        <VirtualKeyboard nextKey={typing.nextKey} lastKeyResult={typing.lastKeyResult} shiftKey={shiftDown} capsLock={capsOn} disabled={false} />
      </>)}

      {showResult && (
        <Modal open={showResult} onClose={handleBack} title="成绩单">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950"><p className="text-2xl font-bold text-indigo-600">{session?.wpm ?? 0}</p><p className="text-xs text-gray-500">速度</p></div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950"><p className="text-2xl font-bold text-green-600">{session?.accuracy ?? 100}%</p><p className="text-xs text-gray-500">正确率</p></div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950"><p className="text-2xl font-bold text-amber-600">{totalChars}</p><p className="text-xs text-gray-500">字符数</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={handleBack}>返回</Button>
              <Button onClick={handleRestart}>再来一次</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}