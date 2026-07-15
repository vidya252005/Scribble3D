import React, { useEffect } from "react";
import Sketchpad from "./components/Sketchpad.jsx";
import PromptPanel from "./components/PromptPanel.jsx";
import ObjectList from "./components/ObjectList.jsx";
import TracePanel from "./components/TracePanel.jsx";
import ExportPanel from "./components/ExportPanel.jsx";
import SceneViewer from "./components/SceneViewer.jsx";
import useSceneStore from "./store/useSceneStore.js";
import { fetchDefaultScene } from "./api.js";

export default function App() {
  const setScene = useSceneStore((s) => s.setScene);
  const setError = useSceneStore((s) => s.setError);

  useEffect(() => {
    fetchDefaultScene()
      .then(({ scene, objects }) => setScene(scene, objects))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Scribble3D</span>
        <span className="app-subtitle">Late Night Lab — one persistent scene</span>
      </header>

      <main className="app-main">
        <section className="input-column">
          <Sketchpad />
          <PromptPanel />
          <ObjectList />
          <TracePanel />
        </section>

        <section className="output-column">
          <SceneViewer />
          <ExportPanel />
        </section>
      </main>
    </div>
  );
}
