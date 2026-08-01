// Standard ANSI QWERTY keyboard rows
export const KEYBOARD_ROWS: string[][] = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  [" "],
];

// Modifier keys that don't participate in highlighting
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
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
]);

// Finger zone mapping (left hand: warm, right hand: cool)
export const FINGER_ZONES: Record<string, "left" | "right"> = {
  // Left pinky
  "`": "left",
  "1": "left",
  q: "left",
  a: "left",
  z: "left",
  // Left ring
  "2": "left",
  w: "left",
  s: "left",
  x: "left",
  // Left middle
  "3": "left",
  e: "left",
  d: "left",
  c: "left",
  // Left index
  "4": "left",
  "5": "left",
  r: "left",
  t: "left",
  f: "left",
  g: "left",
  v: "left",
  b: "left",
  // Right index
  "6": "right",
  "7": "right",
  y: "right",
  u: "right",
  h: "right",
  j: "right",
  n: "right",
  m: "right",
  // Right middle
  "8": "right",
  i: "right",
  k: "right",
  ",": "right",
  // Right ring
  "9": "right",
  o: "right",
  l: "right",
  ".": "right",
  // Right pinky
  "0": "right",
  "-": "right",
  "=": "right",
  p: "right",
  "[": "right",
  "]": "right",
  ";": "right",
  "'": "right",
  "\\": "right",
  "/": "right",
};

export function normalizeKey(key: string): string {
  if (key === " ") return " ";
  return key.toLowerCase();
}
