// Standard ANSI QWERTY keyboard rows
export const KEYBOARD_ROWS: string[][] = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Ctrl", "Win", "Alt", "Space", "Alt", "Fn", "Ctrl"],
];

// Modifier keys that do not participate in highlighting
export const MODIFIER_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "Tab",
  "CapsLock",
  "Backspace",
  "Enter",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Delete",
  "Insert",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "NumLock",
  "ScrollLock",
  "Pause",
  "ContextMenu",
  "Fn",
  "F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12",
]);

// Finger zone mapping
export const FINGER_ZONES: Record<string, "left" | "right"> = {
  "`": "left","1": "left","2": "left","q": "left","a": "left","z": "left",
  "3": "left","w": "left","s": "left","x": "left",
  "4": "left","e": "left","d": "left","c": "left",
  "5": "left","r": "left","f": "left","v": "left",
  "t": "left","g": "left","b": "left",
  "6": "right","7": "right","y": "right","h": "right","n": "right",
  "u": "right","j": "right","m": "right",
  "8": "right","i": "right","k": "right",",": "right",
  "9": "right","o": "right","l": "right",".": "right",
  "0": "right","-": "right","=": "right","p": "right",
  "[": "right","]": "right",";": "right","'": "right",
  "\\": "right","/": "right",
};

/** Shift symbol mapping for US QWERTY keyboard */
export const SHIFT_MAP: Record<string, string> = {
  "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
  "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
  "-": "_", "=": "+",
  "[": "{", "]": "}", "\\": "|",
  ";": ":", "'": "\"",
  ",": "<", ".": ">", "/": "?",
};

export function normalizeKey(key: string): string {
  if (key === " ") return " ";
  return key.toLowerCase();
}