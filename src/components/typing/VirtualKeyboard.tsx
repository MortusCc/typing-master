import { memo } from "react";
import { KEYBOARD_ROWS, FINGER_ZONES } from "../../services/keyboardLayout.ts";

interface VirtualKeyboardProps {
  nextKey: string | null;
  lastKeyResult: "correct" | "error" | null;
  shiftKey?: boolean;
  capsLock?: boolean;
  showFingerZones?: boolean;
  disabled?: boolean;
}

const MOD_KEYS = new Set(["Backspace", "Tab", "Caps", "Enter", "Shift", "Ctrl", "Win", "Alt", "Fn"]);

export const VirtualKeyboard = memo(function VirtualKeyboard({
  nextKey,
  lastKeyResult,
  shiftKey = false,
  capsLock = false,
  showFingerZones = true,
  disabled = false,
}: VirtualKeyboardProps) {
  const next = nextKey?.toLowerCase() ?? null;
  const upper = shiftKey !== capsLock; // XOR: uppercase when exactly one is active

  const formatKey = (key: string) => {
    if (key === "Space") return "";
    if (MOD_KEYS.has(key)) return key;
    return upper ? key.toUpperCase() : key;
  };

  const getKeyClass = (key: string) => {
    const lower = key.toLowerCase();
    const isNext = !disabled && next === lower && !MOD_KEYS.has(key);
    const zone = showFingerZones ? FINGER_ZONES[lower] : null;
    let cls = "flex items-center justify-center rounded-md text-xs font-semibold transition-all duration-100 select-none ";

    if (key === "Space") {
      cls += "flex-1 max-w-[12rem] h-8 sm:h-9 ";
    } else if (MOD_KEYS.has(key)) {
      cls += "px-1 sm:px-2 h-8 sm:h-9 text-[0.55rem] sm:text-[0.6rem] text-gray-400 dark:text-gray-600 bg-gray-200 dark:bg-gray-800 ";
    } else {
      cls += "w-7 sm:w-9 h-8 sm:h-9 ";
    }

    if (!MOD_KEYS.has(key) && key !== "Space") {
      if (zone === "left") {
        cls += "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 ";
      } else if (zone === "right") {
        cls += "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 ";
      } else {
        cls += "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ";
      }
    }

    if (isNext) {
      cls += "ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900 animate-key-pulse scale-110 ";
    }
    if (isNext && lastKeyResult === "correct") {
      cls += "animate-key-flash-correct ";
    }
    if (isNext && lastKeyResult === "error") {
      cls += "animate-key-flash-error ";
    }
    return cls;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-1 rounded-xl bg-gray-50 p-2 dark:bg-gray-900 sm:p-3">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-0.5 sm:gap-1">
          {row.map((key) => (
            <div key={key} className={getKeyClass(key)}>
              {key === "Space" ? (
                <span className="text-[0.55rem] text-gray-400 dark:text-gray-500">空格</span>
              ) : (
                formatKey(key)
              )}
            </div>
          ))}
        </div>
      ))}

      {showFingerZones && (
        <div className="flex justify-center gap-4 pt-1 text-[0.6rem] text-gray-400 dark:text-gray-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-200 dark:bg-amber-800" />Left
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-blue-200 dark:bg-blue-800" />Right
          </span>
        </div>
      )}
    </div>
  );
});