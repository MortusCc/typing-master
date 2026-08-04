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
  saveProgress: (mode: string, data: Record<string, unknown>) => void;
  restoreProgress: (mode: string) => Record<string, unknown> | null;
  clearProgress: (mode: string) => void;
  restoreStats: (data: Record<string, unknown>) => void;
  getStats: () => { backspaceCount: number; totalKeystrokes: number; startTime: number | null };
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
      backspaceCount: get().backspaceCount + 1,
      totalKeystrokes: get().totalKeystrokes + 1,
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

  saveProgress: (mode: string, data: Record<string, unknown>) => {
    const stats = get().getStats();
    const key = "typing_master_progress_" + mode;
    localStorage.setItem(key, JSON.stringify({ ...data, ...stats, savedAt: Date.now() }));
  },
  restoreProgress: (mode: string) => {
    const key = "typing_master_progress_" + mode;
    const r = localStorage.getItem(key);
    if (!r) return null;
    try { return JSON.parse(r); } catch { return null; }
  },
  clearProgress: (mode: string) => {
    localStorage.removeItem("typing_master_progress_" + mode);
  },
  restoreStats: (data: Record<string, unknown>) => {
    const updates: Partial<TypingStore> = {};
    if (data.backspaceCount != null) updates.backspaceCount = data.backspaceCount as number;
    if (data.totalKeystrokes != null) updates.totalKeystrokes = data.totalKeystrokes as number;
    if (data.startTime != null) updates.startTime = data.startTime as number;
    if (Object.keys(updates).length > 0) set(updates);
  },
  resetStats: () => {
    set({ backspaceCount: 0, totalKeystrokes: 0, startTime: null });
  },
  getStats: () => {
    const { backspaceCount, totalKeystrokes, startTime } = get();
    return { backspaceCount, totalKeystrokes, startTime };
  },
  getSession: () => {
    const { materialId, materialName, mode, startTime, target, cursor, wpm, accuracy, errorCount, state, backspaceCount, totalKeystrokes } = get();
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
      backspaceCount,
      totalKeystrokes,
      duration: startTime ? Date.now() - startTime : 0,
      errorDetails: [],
    };
  },
}));
