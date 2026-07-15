// Resolves a color for a new/edited object.
// Priority: explicit color word found in the prompt > sensible per-type default.

const COLOR_WORDS = {
  red: "#c0392b",
  blue: "#2e6da4",
  green: "#3d8b4c",
  yellow: "#d9b93c",
  orange: "#d4772e",
  purple: "#7b4fa0",
  violet: "#7b4fa0",
  pink: "#c96a92",
  black: "#2b2b2b",
  white: "#f2f2ee",
  gray: "#8a8a8a",
  grey: "#8a8a8a",
  brown: "#7a5230",
  tan: "#c9a06b",
  beige: "#dccbb0",
  cyan: "#2e9ba4",
  teal: "#2f7f78",
  gold: "#c9a13b",
  silver: "#b6b6b6",
  maroon: "#7a2532",
  navy: "#243b5a",
  lime: "#7ab648",
};

// Generic fallback palette, cycled deterministically by object-type name so the
// same type always gets the same "generic" color when the user gives no hint.
const GENERIC_PALETTE = [
  "#5b7fa6", // slate blue
  "#7a9d6f", // sage green
  "#c98a4b", // warm ochre
  "#a6667c", // dusty rose
  "#7d7d99", // muted violet-gray
  "#c2a35c", // sand gold
  "#5f9ea0", // teal
  "#a15c4e", // terracotta
];

const TYPE_DEFAULTS = {
  room: { wall: "#e8e4da", floor: "#a98f6c", roof: "#6b5744" },
  man: { skin: "#dfae82", shirt: "#3b6ea5", pants: "#333d47" },
  tree: { trunk: "#6b4a2f", foliage: "#4c7a3d" },
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function extractColorWord(prompt) {
  const lower = prompt.toLowerCase();
  for (const word of Object.keys(COLOR_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) {
      return { word, hex: COLOR_WORDS[word] };
    }
  }
  return null;
}

function genericColorFor(type) {
  const idx = hashString(type) % GENERIC_PALETTE.length;
  return GENERIC_PALETTE[idx];
}

function resolveColor(prompt, type) {
  const explicit = extractColorWord(prompt);
  if (explicit) {
    return { color: explicit.hex, source: `explicit color word "${explicit.word}"` };
  }
  if (TYPE_DEFAULTS[type]) {
    // return the "primary" default (first key) as the object's headline color
    const first = Object.values(TYPE_DEFAULTS[type])[0];
    return { color: first, source: `type default for "${type}"` };
  }
  return { color: genericColorFor(type), source: `generic palette (no color mentioned)` };
}

module.exports = { resolveColor, extractColorWord, genericColorFor, TYPE_DEFAULTS, COLOR_WORDS };
