const { classify } = require("./intentClassifier");
const { classifyWithLLM, isConfigured } = require("./llmClient");
const { resolveColor } = require("./colorResolver");
const { resolveBuilder } = require("./tools/builders");

// Simple grid auto-layout so newly created objects don't stack on top of
// each other in the shared "Late Night Lab" scene.
function nextGridPosition(index) {
  const spacing = 3.2;
  const perRow = 4;
  const col = index % perRow;
  const row = Math.floor(index / perRow);
  return [(col - (perRow - 1) / 2) * spacing, 0, row * spacing];
}

function recolorParts(parts, newColor) {
  return parts.map((p) => ({ ...p, color: newColor }));
}

/**
 * Runs the full agent pipeline for either creating a new object or editing
 * the currently-selected one. Returns the finished object spec plus a
 * human-readable trace of every step the agent took (shown in the UI's
 * trace panel).
 */
async function runAgent({ prompt, targetObject, existingObjectCount }) {
  const trace = [];
  trace.push(`Received prompt: "${prompt}"`);

  const hasSelection = Boolean(targetObject);

  // Step 1: intent classification (LLM if configured, else rule-based)
  let intent;
  if (isConfigured()) {
    trace.push("LLM_API_KEY detected — routing classification through the LLM");
    const llmResult = await classifyWithLLM(prompt, { hasSelection });
    if (llmResult) {
      intent = {
        action: llmResult.action || "create",
        type: llmResult.type || "generic",
        windows: llmResult.windows || 0,
        size: llmResult.sizeMultiplier ? { mult: llmResult.sizeMultiplier } : null,
        direction: llmResult.direction ? { vec: llmResult.direction } : null,
        rawPrompt: prompt,
        llmColor: llmResult.color || null,
      };
      trace.push("LLM classification succeeded");
    } else {
      trace.push("LLM call failed or returned nothing usable — falling back to rule-based classifier");
      intent = classify(prompt, { hasSelection });
    }
  } else {
    trace.push("No LLM_API_KEY configured — using rule-based intent classifier");
    intent = classify(prompt, { hasSelection });
  }
  trace.push(`Classified intent: action="${intent.action}", type="${intent.type}"`);

  // ---------- EDIT PATH ----------
  if (intent.action === "edit" && targetObject) {
    trace.push(`Editing selected object #${targetObject.objectId} (${targetObject.label})`);
    let parts = targetObject.parts;
    let color = targetObject.color;
    let position = targetObject.position;
    let scale = targetObject.scale;
    let label = targetObject.label;
    let type = targetObject.type;

    const typeChanged = intent.type !== "generic" && intent.type !== targetObject.type;
    if (typeChanged) {
      trace.push(`Detected a different object type ("${intent.type}") — performing a full rebuild instead of a patch`);
      const colorInfo = resolveColor(prompt, intent.type);
      const builder = resolveBuilder(intent.type);
      const built = builder({ color: colorInfo.color, intent });
      parts = built.parts;
      color = colorInfo.color;
      label = built.label;
      type = intent.type;
      trace.push(`Assigned color ${colorInfo.color} (${colorInfo.source})`);
      trace.push(`Invoked builder for "${intent.type}" — assembled ${parts.length} primitive part(s)`);
    } else {
      let changed = false;
      const explicitColor = intent.llmColor || resolveColorWordOnly(prompt);
      if (explicitColor) {
        color = explicitColor;
        parts = recolorParts(parts, explicitColor);
        trace.push(`Recolored object to ${explicitColor}`);
        changed = true;
      }
      if (intent.size) {
        const mult = intent.size.mult;
        scale = scale.map((s) => Number((s * mult).toFixed(3)));
        trace.push(`Resized object by factor ${mult} (${intent.size.word || "llm-specified"})`);
        changed = true;
      }
      if (intent.direction) {
        const [dx, dy, dz] = intent.direction.vec;
        position = [position[0] + dx, position[1] + dy, position[2] + dz];
        trace.push(`Moved object by (${dx}, ${dy}, ${dz})`);
        changed = true;
      }
      if (!changed) {
        trace.push("No specific color/size/position change detected in the prompt — object left as-is, only trace updated");
      }
    }

    return {
      objectId: targetObject.objectId,
      type,
      label,
      color,
      position,
      rotation: targetObject.rotation,
      scale,
      params: targetObject.params,
      parts,
      prompt,
      trace,
    };
  }

  // ---------- CREATE PATH ----------
  const colorInfo = resolveColor(prompt, intent.type);
  trace.push(`Assigned color ${colorInfo.color} (${colorInfo.source})`);

  const builder = resolveBuilder(intent.type);
  const built = builder({ color: colorInfo.color, intent });
  trace.push(`Invoked builder for type "${intent.type}" — assembled ${built.parts.length} primitive part(s)`);

  let scale = [1, 1, 1];
  if (intent.size) {
    scale = [intent.size.mult, intent.size.mult, intent.size.mult];
    trace.push(`Applied size modifier "${intent.size.word}" -> scale ${intent.size.mult}`);
  }

  const position = nextGridPosition(existingObjectCount);
  trace.push(`Placed object in the shared scene at grid position (${position[0].toFixed(1)}, ${position[1]}, ${position[2].toFixed(1)})`);

  return {
    type: intent.type,
    label: built.label,
    color: colorInfo.color,
    position,
    rotation: [0, 0, 0],
    scale,
    params: built.params,
    parts: built.parts,
    prompt,
    trace,
  };
}

// small helper reused by the edit path (kept local so llmClient result and
// rule-based classify both funnel through the same color-word logic)
function resolveColorWordOnly(prompt) {
  const { extractColorWord } = require("./colorResolver");
  const found = extractColorWord(prompt);
  return found ? found.hex : null;
}

module.exports = { runAgent };
