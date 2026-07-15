import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import SceneObjectGroup from "../three/SceneObjectGroup.jsx";
import threeRefs from "../three/threeRefs.js";
import useSceneStore from "../store/useSceneStore.js";

export default function SceneViewer() {
  const objects = useSceneStore((s) => s.objects);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const clearSelection = useSceneStore((s) => s.clearSelection);

  const sceneRef = useRef();

  return (
    <div className="scene-viewer">
      <Canvas
        shadows
        camera={{ position: [8, 6, 10], fov: 45 }}
        onCreated={({ scene, camera, gl }) => {
          threeRefs.scene = scene;
          threeRefs.camera = camera;
          threeRefs.gl = gl;
          sceneRef.current = scene;
        }}
        onPointerMissed={() => clearSelection()}
      >
        <color attach="background" args={["#f4f2ec"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 10, 4]} intensity={1} castShadow />
        <directionalLight position={[-6, 4, -4]} intensity={0.3} />

        <Grid
          args={[40, 40]}
          cellColor="#c9c4b6"
          sectionColor="#a39c89"
          fadeDistance={30}
          infiniteGrid
          position={[0, -0.001, 0]}
        />

        {objects.map((obj) => (
          <SceneObjectGroup
            key={obj.objectId}
            object={obj}
            selected={obj.objectId === selectedObjectId}
            onSelect={selectObject}
          />
        ))}

        <OrbitControls makeDefault target={[0, 1, 0]} />
      </Canvas>

      {objects.length === 0 && (
        <div className="empty-hint">
          Type a prompt on the left — e.g. "draw a room with windows" — and hit
          Generate. Everything you create stays here, in this one scene.
        </div>
      )}
    </div>
  );
}
