import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ArticleTypingPage() {
  const navigate = useNavigate();
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
  const [composing, setComposing] = useState(false);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [shiftDown, setShiftDown] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);
  const articles = materials.filter((m) => m.type === "article_en" || m.type === "article_zh");

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
    if (paras.length > 0) typing.init(paras[0], id, mat.name, "sequential");
  }, [typing]);

  const advance = useCallback(() => {
    const next = paraIdx + 1;
    if (next >= paragraphs.length) {
      const s = typing.getSession();
      setSession(s); setShowResult(true); return;
    }
    setDoneChars((p) => p + paragraphs[paraIdx].length);
    setParaIdx(next);
    typing.init(paragraphs[next], selectedId, typing.materialName, "sequential");
    setErrorIndices(new Set());
  }, [paraIdx, paragraphs, selectedId, typing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showResult) return;
      if (e.key === "Shift") { setShiftDown(true); return; }
      if (e.key === "CapsLock") { setCapsOn(e.getModifierState?.("CapsLock") ?? false); return; }
      if (e.isComposing || e.key === "Dead") return;
      if (e.key === "Backspace") { e.preventDefault(); typing.handleBackspace(); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        if (typing.cursor >= typing.target.length && typing.target.length > 0) advance();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault(); typing.handleKey(e.key);
        const ni = typing.input + e.key;
        const inds = new Set<number>();
        for (let i = 0; i < Math.min(ni.length, typing.target.length); i++) {
          if (ni[i] !== typing.target[i]) inds.add(i);
        }
        setErrorIndices(inds);
      }
    };
    const keyup = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftDown(false); };
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", keyup);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("keyup", keyup); };
  }, [typing, showResult, advance]);

  useEffect(() => {
    const cs = () => setComposing(true);
    const ce = () => setComposing(false);
    document.addEventListener("compositionstart", cs);
    document.addEventListener("compositionend", ce);
    return () => { document.removeEventListener("compositionstart", cs); document.removeEventListener("compositionend", ce); };
  }, []);

  const handleRestart = () => {
    if (!paragraphs.length) return;
    setParaIdx(0); setDoneChars(0); setShowResult(false); setSession(null);
    typing.init(paragraphs[0], selectedId, typing.materialName, "sequential");
  };
  const handleBack = () => { typing.reset(); navigate("/"); };

  const cur = paragraphs[paraIdx] ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">文章打字</h1>
        <select value={selectedId} onChange={(e) => handleSelect(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">选择...</option>
          {articles.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
        </select>
      </div>
      {!selectedId && (<div className="py-20 text-center text-gray-400">选择一篇文章开始练习</div>)}
      {cur && (<>
        <StatsBar wpm={typing.wpm} accuracy={typing.accuracy} current={doneChars + typing.cursor} total={totalChars} />
        <ArticleView paragraph={cur} translation={translations[paraIdx]} input={typing.input}
          cursor={typing.cursor} errorIndices={errorIndices} paragraphIndex={paraIdx}
          totalParagraphs={paragraphs.length} composing={composing} />
        <div className="text-center text-xs text-gray-400">按 Enter 进入下一段</div>
        <VirtualKeyboard nextKey={typing.nextKey} lastKeyResult={typing.lastKeyResult}
          shiftKey={shiftDown} capsLock={capsOn} disabled={composing} />
      </>)}
      {showResult && (
        <Modal open={showResult} onClose={handleBack} title="成绩单">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
                <p className="text-2xl font-bold text-indigo-600">{session?.wpm ?? 0}</p>
                <p className="text-xs text-gray-500">速度</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{session?.accuracy ?? 100}%</p>
                <p className="text-xs text-gray-500">正确率</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <p className="text-2xl font-bold text-amber-600">{totalChars}</p>
                <p className="text-xs text-gray-500">字符数</p>
              </div>
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