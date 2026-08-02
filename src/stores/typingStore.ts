import { create } from "zustand";
import type { EngineState, KeyResult, PracticeMode, TypingSession } from "../types/typing.ts";
import { generateId } from "../services/db/repositories.ts";

interface TypingStore {
  state: EngineState;
  mode: PracticeMode;
  materialId: string | null;
  materialName: string;
  target: string;
  input: string;
  cursor: number;
  startTime: number | null;
  wpm: number;
  accuracy: number;
  nextKey: string | null;
  lastKeyResult: "correct" | "error" | null;
  errorCount: number;
  totalKeystrokes: number;
  backspaceCount: number;

  init: (target: string, materialId: string, materialName: string, mode: PracticeMode) => void;
  handleKey: (key: string) => KeyResult;
  handleBackspace: () => void;
  reset: () => void;
  getSession: () => TypingSession | null;
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  state: "idle",
  mode: "sequential",
  materialId: null,
  materialName: "",
  target: "",
  input: "",
  cursor: 0,
  startTime: null,
  wpm: 0,
  accuracy: 100,
  nextKey: null,
  lastKeyResult: null,
  errorCount: 0,
  totalKeystrokes: 0,
  backspaceCount: 0,

  init: (target, materialId, materialName, mode) => {
    set({
      state: "running",
      mode,
      materialId,
      materialName,
      target,
      input: "",
      cursor: 0,
      startTime: get().startTime ?? Date.now(),
      accuracy: 100,
      nextKey: target[0] ?? null,
      lastKeyResult: null,
      errorCount: 0,
    });
  },

  handleKey: (key) => {
    const { state, target, cursor, startTime, totalKeystrokes, errorCount } = get();
    if (state !== "running") return { type: "finished", nextChar: null };

    const targetChar = target[cursor];
    // Allow input beyond target length (for corrections)
    const isCorrect = targetChar !== undefined && key === targetChar;
    const newCursor = cursor + 1;
    const newTotalKeystrokes = totalKeystrokes + 1;
    const newErrorCount = isCorrect ? errorCount : errorCount + 1;
    const newInput = get().input + key;

    // Calculate WPM
    const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 / 60; // minutes
    const grossWpm = elapsed > 0 ? (newTotalKeystrokes / 5) / elapsed : 0;
    const newAccuracy =
      newTotalKeystrokes > 0
        ? Math.round(((newTotalKeystrokes - newErrorCount) / newTotalKeystrokes) * 100)
        : 100;

    const finished = false; // never auto-finish, wait for Enter
    const nextChar = target[newCursor] ?? null;

    set({
      input: newInput,
      cursor: newCursor,
      totalKeystrokes: newTotalKeystrokes,
      errorCount: newErrorCount,
      wpm: Math.round(grossWpm),
      accuracy: newAccuracy,
      nextKey: nextChar,
      lastKeyResult: isCorrect ? "correct" : "error",
      state: "running",
    });

    return {
      type: finished ? "finished" : isCorrect ? "correct" : "incorrect",
      nextChar,
    };
  },

  handleBackspace: () => {
    const { state, cursor, input, target } = get();
    if (state !== "running" || cursor <= 0) return;

    const newCursor = cursor - 1;
    const newInput = input.slice(0, -1);

    set({
      input: newInput,
      cursor: newCursor,
      nextKey: target[newCursor] ?? null,
      lastKeyResult: null,
      // Don't change totalKeystrokes on backspace
    });
  },

  reset: () => {
    set({
      state: "idle",
      materialId: null,
      materialName: "",
      target: "",
      input: "",
      cursor: 0,
      startTime: null,
      wpm: 0,
      accuracy: 100,
      nextKey: null,
      lastKeyResult: null,
      errorCount: 0,
      totalKeystrokes: 0,
    });
  },

  saveWordProgress: (currentIdx: number, errorWords: { english: string; chinese: string }[]) => {
    const { materialId, materialName, startTime, totalKeystrokes, backspaceCount } = get();
    localStorage.setItem("typing_master_word_progress", JSON.stringify({
      materialId, materialName, currentIdx, errorWords, startTime, totalKeystrokes, backspaceCount,
      savedAt: Date.now(),
    }));
  },
  restoreWordProgress: () => {
    const r = localStorage.getItem("typing_master_word_progress");
    if (!r) return null;
    try { return JSON.parse(r); } catch { return null; }
  },
  clearWordProgress: () => {
    localStorage.removeItem("typing_master_word_progress");
  },
  getSession: () => {
    const { materialId, materialName, mode, startTime, target, cursor, wpm, accuracy, errorCount, state } = get();
    if (!materialId || !startTime) return null;

    return {
      id: generateId(),
      materialId,
      materialName,
      mode,
      startedAt: startTime,
      finishedAt: state === "finished" ? Date.now() : null,
      totalChars: target.length,
      correctChars: cursor - errorCount,
      errorChars: errorCount,
      wpm,
      accuracy,
      duration: startTime ? Date.now() - startTime : 0,
      errorDetails: [],
    };
  },
}));
