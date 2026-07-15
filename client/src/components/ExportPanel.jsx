import React, { useState } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import threeRefs from "../three/threeRefs.js";

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportPanel() {
  const [busy, setBusy] = useState(false);

  const exportGLTF = (binary) => {
    const { scene } = threeRefs;
    if (!scene) return;
    setBusy(true);
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        if (binary) {
          download(new Blob([result], { type: "application/octet-stream" }), "scribble3d-scene.glb");
        } else {
          const json = JSON.stringify(result, null, 2);
          download(new Blob([json], { type: "application/json" }), "scribble3d-scene.gltf");
        }
        setBusy(false);
      },
      (err) => {
        console.error("GLTF export failed", err);
        setBusy(false);
      },
      { binary }
    );
  };

  const exportPNG = () => {
    const { gl, scene, camera } = threeRefs;
    if (!gl || !scene || !camera) return;
    gl.render(scene, camera);
    gl.domElement.toBlob((blob) => {
      if (blob) download(blob, "scribble3d-scene.png");
    }, "image/png");
  };

  return (
    <div className="panel-block">
      <div className="panel-block-header">
        <span>Export</span>
      </div>
      <div className="export-buttons">
        <button className="btn-secondary" onClick={() => exportGLTF(true)} disabled={busy}>
          Export .glb
        </button>
        <button className="btn-secondary" onClick={() => exportGLTF(false)} disabled={busy}>
          Export .gltf
        </button>
        <button className="btn-secondary" onClick={exportPNG} disabled={busy}>
          Export .png
        </button>
      </div>
    </div>
  );
}
