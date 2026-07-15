import React from "react";
import useSceneStore from "../store/useSceneStore.js";

export default function TracePanel() {
  const trace = useSceneStore((s) => s.trace);
  const error = useSceneStore((s) => s.error);

  return (
    <div className="panel-block">
      <div className="panel-block-header">
        <span>Agent Trace</span>
      </div>
      {error && <p className="error-text">{error}</p>}
      {trace.length === 0 ? (
        <p className="hint-text">Run a prompt to see the agent's steps here.</p>
      ) : (
        <ol className="trace-list">
          {trace.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
