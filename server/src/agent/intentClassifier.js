// Rule-based NLP classifier. This is the fallback "reasoning" step of the agent
// and runs whenever no LLM_API_KEY is configured (see agent/llmClient.js).
// It looks at the prompt text and decides:
//   1. what kind of object is being requested (type)
//   2. whether this is a brand-new object or an edit of the selected one
//   3. numeric / descriptive modifiers (size, window count, material, direction)

const TYPE_KEYWORDS = {
  room: ["room", "house", "wall", "walls", "cabin", "office"],
  man: ["man", "person", "human", "woman", "guy", "figure", "character", "people"],
  tree: ["tree", "plant", "bush", "palm"],
  car: ["car", "vehicle", "truck", "automobile"],
  table: ["table", "desk"],
  chair: ["chair", "seat", "stool"],
  lamp: ["lamp", "light", "lantern"],
  sphere: ["ball", "sphere", "orb", "globe"],
  box: ["box", "cube", "crate", "block"],
  cylinder: ["cylinder", "pillar", "column", "pipe"],
  cone: ["cone", "pyramid"],
  door: ["door", "gate"],
  window: ["window"],
};

const EDIT_VERBS = [
  "change", "recolor", "re-color", "make it", "turn it", "turn the",
  "move", "bigger", "smaller", "larger", "shrink", "grow", "resize",
  "rotate", "spin", "shift", "scale", "edit", "update", "paint",
];

const SIZE_WORDS = {
  tiny: 0.5,
  small: 0.7,
  little: 0.75,
  big: 1.4,
  large: 1.5,
  huge: 1.9,
  massive: 2.2,
  giant: 2.2,
};

const DIRECTIONS = {
  left: [-1.5, 0, 0],
  right: [1.5, 0, 0],
  up: [0, 1, 0],
  down: [0, -1, 0],
  forward: [0, 0, -1.5],
  back: [0, 0, 1.5],
  backward: [0, 0, 1.5],
};

function detectType(promptLower) {
  for (const [type, words] of Object.entries(TYPE_KEYWORDS)) {
    for (const w of words) {
      if (promptLower.includes(w)) return type;
    }
  }
  return null;
}

function detectSizeMultiplier(promptLower) {
  for (const [word, mult] of Object.entries(SIZE_WORDS)) {
    if (promptLower.includes(word)) return { word, mult };
  }
  return null;
}

function detectDirection(promptLower) {
  for (const [word, vec] of Object.entries(DIRECTIONS)) {
    if (new RegExp(`\\b${word}\\b`).test(promptLower)) return { word, vec };
  }
  return null;
}

function detectWindowCount(promptLower) {
  const match = promptLower.match(/(\d+)\s*windows?/);
  if (match) return parseInt(match[1], 10);
  if (promptLower.includes("window")) return 2; // "with windows" -> sensible default
  return 0;
}

function isEditIntent(promptLower, hasSelection) {
  if (!hasSelection) return false;
  return EDIT_VERBS.some((v) => promptLower.includes(v)) || /\brecolor\b/.test(promptLower);
}

function classify(prompt, { hasSelection = false } = {}) {
  const lower = prompt.toLowerCase();
  const type = detectType(lower);
  const size = detectSizeMultiplier(lower);
  const direction = detectDirection(lower);
  const windows = detectWindowCount(lower);
  const action = isEditIntent(lower, hasSelection) ? "edit" : "create";

  return {
    action,
    type: type || "generic",
    typeConfidence: type ? "matched keyword" : "no keyword matched, using generic block",
    size,
    direction,
    windows,
    rawPrompt: prompt,
  };
}

module.exports = { classify, TYPE_KEYWORDS, SIZE_WORDS, DIRECTIONS };
