// Thin wrapper around an LLM call for intent classification / parameter
// extraction. LLM_API_KEY is intentionally left empty in .env.example — the
// user said they'll add it later. Until then every call resolves to `null`
// and the planner (agent/planner.js) falls back to the rule-based
// intentClassifier.js, so the whole pipeline still works with zero cost / no
// key required.

const PROVIDER = process.env.LLM_PROVIDER || "anthropic";
const MODEL = process.env.LLM_MODEL || "claude-sonnet-4-6";

function isConfigured() {
  return Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY.trim().length > 0);
}

// Returns a structured intent object like intentClassifier.classify(), or
// null if no key is configured / the call fails, so the caller can fall back.
async function classifyWithLLM(prompt, context) {
  if (!isConfigured()) return null;

  const systemPrompt = `You are the reasoning step of a sketch-to-3D agent.
Given a user prompt (and whether an object is currently selected), return ONLY
strict JSON of the shape:
{"action":"create|edit","type":"room|man|tree|car|table|chair|lamp|sphere|box|cylinder|cone|generic","color":"<hex or null>","windows":<int>,"sizeMultiplier":<float or null>,"direction":[x,y,z] or null}
No prose, no markdown fences.`;

  try {
    if (PROVIDER === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.LLM_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Prompt: "${prompt}"\nSelectedObject: ${context.hasSelection ? "yes" : "no"}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).map((c) => c.text || "").join("");
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    }

    // Generic OpenAI-compatible fallback path
    const res = await fetch(process.env.LLM_BASE_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Prompt: "${prompt}"\nSelectedObject: ${context.hasSelection ? "yes" : "no"}` },
        ],
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.warn("[llmClient] LLM call failed, falling back to rule-based classifier:", err.message);
    return null;
  }
}

module.exports = { classifyWithLLM, isConfigured };
