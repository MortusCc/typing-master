import { useEffect, useState, useCallback, useRef } from "react";
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

const getTypingState = useTypingStore.getState;

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
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [shiftDown, setShiftDown] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const showResultRef = useRef(false);
  showResultRef.current = showResult;

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
    setTimeout(() => inputRef.current?.focus(), 100);
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
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [paraIdx, paragraphs, selectedId, typing]);

  const updateErrors = () => {
    const st = getTypingState();
    const inds = new Set<number>();
    for (let i = 0; i < Math.min(st.input.length, st.target.length); i++) {
      if (st.input[i] !== st.target[i]) inds.add(i);
    }
    setErrorIndices(inds);
  };

  // Track IME composition state
  useEffect(() => {
    const el = inputRef.current; if (!el) return;
    const cs = () => { composingRef.current = true; };
    const ce = () => { composingRef.current = false; };
    el.addEventListener("compositionstart", cs);
    el.addEventListener("compositionend", ce);
    return () => { el.removeEventListener("compositionstart", cs); el.removeEventListener("compositionend", ce); };
  }, [paraIdx]);

  // Native beforeinput on input element (bypasses React synthetic events)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handler = (e: InputEvent) => {
      if (showResultRef.current) return;
      if (e.inputType === "insertText" || e.inputType === "insertCompositionText" || e.inputType === "insertFromPaste") {
        e.preventDefault();
        const text = e.data ?? "";
        for (const ch of text) getTypingState().handleKey(ch);
        // Reset input value to keep it empty
        el.value = "";
        updateErrors();
        return;
      }
      if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward" || e.inputType === "deleteByCut") {
        e.preventDefault();
        getTypingState().handleBackspace();
        updateErrors();
        return;
      }
      if (e.inputType?.startsWith("insert")) e.preventDefault();
    };
    el.addEventListener("beforeinput", handler);
    return () => el.removeEventListener("beforeinput", handler);
  }, [paraIdx]);

  // keydown: only for Enter navigation + Shift/CapsLock tracking
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Shift") { setShiftDown(true); return; }
      if (e.key === "CapsLock") { setCapsOn(e.getModifierState?.("CapsLock") ?? false); return; }
      if (e.key === "Enter") {
        const st = getTypingState();
        if (st.cursor >= st.target.length && st.target.length > 0) advance();
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const handleBack = () => { typing.reset(); navigate("/"); };

  const cur = paragraphs[paraIdx] ?? "";

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        className="fixed left-0 top-0 h-0 w-0 opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Article Typing</h1>
        <select value={selectedId} onChange={(e) => handleSelect(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">Select...</option>
          {articles.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
        </select>
      </div>
      {!selectedId && (<div className="py-20 text-center text-gray-400">Select an article to start typing</div>)}
      {cur && (<>
        <StatsBar wpm={typing.wpm} accuracy={typing.accuracy} current={doneChars + typing.cursor} total={totalChars} />
        <ArticleView paragraph={cur} translation={translations[paraIdx]} input={typing.input}
          cursor={typing.cursor} errorIndices={errorIndices} paragraphIndex={paraIdx}
          totalParagraphs={paragraphs.length} composing={false} />
        <div className="text-center text-xs text-gray-400">Enter to next paragraph</div>
        <VirtualKeyboard nextKey={typing.nextKey} lastKeyResult={typing.lastKeyResult}
          shiftKey={shiftDown} capsLock={capsOn} disabled={false} />
      </>)}
      {showResult && (
        <Modal open={showResult} onClose={handleBack} title="Result">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
                <p className="text-2xl font-bold text-indigo-600">{session?.wpm ?? 0}</p>
                <p className="text-xs text-gray-500">WPM</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{session?.accuracy ?? 100}%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <p className="text-2xl font-bold text-amber-600">{totalChars}</p>
                <p className="text-xs text-gray-500">Chars</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleRestart}>Again</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}