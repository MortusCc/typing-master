export type PracticeMode = "sequential" | "random" | "retry_errors" | "timed";

export type EngineState = "idle" | "running" | "paused" | "finished";

export interface KeyResult {
  type: "correct" | "incorrect" | "backspace" | "finished";
  nextChar: string | null;
}

export interface ErrorDetail {
  targetChar: string;
  typedChar: string;
  position: number;
  wordIndex?: number;
}

export interface TypingSession {
  id: string;
  materialId: string;
  materialName: string;
  mode: PracticeMode;
  startedAt: number;
  finishedAt: number | null;
  totalChars: number;
  correctChars: number;
  errorChars: number;
  wpm: number;
  accuracy: number;
  duration: number;
  errorDetails: ErrorDetail[];
}
