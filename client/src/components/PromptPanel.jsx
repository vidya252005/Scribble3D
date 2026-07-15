import React, { useState } from "react";
import useSceneStore from "../store/useSceneStore.js";
import { generateObject } from "../api.js";

export default function PromptPanel() {
  const [prompt, setPrompt] = useState("");
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const objects = useSceneStore((s) => s.objects);
  const upsertObject = useSceneStore((s) => s.upsertObject);
  const setTrace = useSceneStore((s) => s.setTrace);
  const setLoading = useSceneStore((s) => s.setLoading);
  const setError = useSceneStore((s) => s.setError);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const loading = useSceneStore((s) => s.loading);

  const selectedObject = objects.find((o) => o.objectId === selectedObjectId);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { object, trace } = await generateObject({
        prompt: prompt.trim(),
        targetObjectId: selectedObjectId || undefined,
      });
      upsertObject(object);
      setTrace(trace);
      setPrompt("");
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  return (
    <div className="panel-block">
      <div className="panel-block-header">
        <span>Prompt</span>
      </div>

      {selectedObject ? (
        <div className="selection-banner">
          Editing <strong>{selectedObject.label}</strong>
          <button className="btn-tiny" onClick={clearSelection}>
            Deselect
          </button>
        </div>
      ) : (
        <div className="selection-banner selection-banner-muted">
          Nothing selected — new prompts add a new object to the scene.
        </div>
      )}

      <textarea
        className="prompt-input"
        placeholder='e.g. "draw a room with windows", "generate a man", "add a tree", "make it blue and bigger"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
      />

      <button className="btn-primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        {loading ? "Generating…" : selectedObject ? "Edit in Scene" : "Generate"}
      </button>
    </div>
  );
}
