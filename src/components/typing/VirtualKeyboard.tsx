import { memo } from "react";
import { KEYBOARD_ROWS, FINGER_ZONES } from "../../services/keyboardLayout.ts";

interface VirtualKeyboardProps {
  nextKey: string | null;
  lastKeyResult: "correct" | "error" | null;
  showFingerZones?: boolean;
  disabled?: boolean;
}

const MOD_ROW = ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
const BOTTOM_MODS = ["Ctrl", "Win", "Alt", "Space", "Alt", "Win", "Menu", "Ctrl"];

export const VirtualKeyboard = memo(function VirtualKeyboard({
  nextKey,
  lastKeyResult,
  showFingerZones = true,
  disabled = false,
}: VirtualKeyboardProps) {
  const next = nextKey?.toLowerCase() ?? null;

  const getKeyClass = (key: string, isSpace = false) => {
    const lower = key.toLowerCase();
    const isNext = !disabled && next === lower;
    const zone = showFingerZones ? FINGER_ZONES[lower] : null;
    let cls = "flex items-center justify-center rounded-md text-xs font-medium transition-all duration-100 select-none ";
    if (isSpace) { cls += "col-span-5 "; }
    else { cls += "min-w-[1.8rem] sm:min-w-[2.4rem] h-9 sm:h-10 "; }
    if (zone === "left") { cls += "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 "; }
    else if (zone === "right") { cls += "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 "; }
    else { cls += "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 "; }
    if (isNext) { cls += "ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900 animate-key-pulse "; }
    if (isNext && lastKeyResult === "correct") { cls += "animate-key-flash-correct "; }
    if (isNext && lastKeyResult === "error") { cls += "animate-key-flash-error "; }
    return cls;
  };

  const getModClass = () =>
    "flex items-center justify-center rounded-md text-[0.6rem] sm:text-xs text-gray-400 dark:text-gray-600 px-1 h-6 select-none";

  return (
    <div className="mx-auto max-w-3xl space-y-1.5 rounded-xl bg-gray-50 p-2 dark:bg-gray-900 sm:p-3">
      <div className="flex justify-center gap-0.5 sm:gap-1">
        {MOD_ROW.map((key) => (<div key={key} className={getModClass()}>{key}</div>))}
      </div>
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-0.5 sm:gap-1">
          {ri === 0 && <div className={getModClass() + " min-w-[2rem] sm:min-w-[2.8rem]"}>`</div>}
          {row.map((key) => (<div key={key} className={getKeyClass(key, key === " ")}>{key === " " ? "Space" : key}</div>))}
          {ri === 1 && <div className={getModClass() + " min-w-[2rem] sm:min-w-[2.8rem]"}>Bksp</div>}
          {ri === 2 && <div className={getModClass() + " min-w-[2.5rem] sm:min-w-[3.5rem]"}>Enter</div>}
          {ri === 3 && <div className={getModClass() + " min-w-[2.5rem] sm:min-w-[3.5rem]"}>Shift</div>}
        </div>
      ))}
      <div className="flex justify-center gap-0.5 sm:gap-1">
        {BOTTOM_MODS.map((key) => (
          <div key={key} className={key === "Space" ? "flex items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400 h-9 sm:h-10 flex-1 max-w-[16rem] select-none" : "flex items-center justify-center rounded-md bg-gray-200 text-[0.6rem] sm:text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2 h-9 sm:h-10 select-none"}>{key === "Space" ? "" : key}</div>
        ))}
      </div>
      {showFingerZones && (
        <div className="flex justify-center gap-4 pt-1 text-[0.6rem] text-gray-400 dark:text-gray-600">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-amber-200 dark:bg-amber-800" />Left</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-blue-200 dark:bg-blue-800" />Right</span>
        </div>
      )}
    </div>
  );
});