import React, { useMemo } from "react";
import PrimitiveMesh from "./PrimitiveMesh.jsx";

function computeBounds(parts) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  parts.forEach((p) => {
    const [x, y, z] = p.position || [0, 0, 0];
    const d = p.dims || {};
    const hw = (d.width || d.radius || d.radiusBottom || d.radiusTop || 0.5) / 1.6;
    const hh = (d.height || d.radius || 0.5) / 1.6;
    const hd = (d.depth || d.radius || d.radiusBottom || d.radiusTop || 0.5) / 1.6;
    minX = Math.min(minX, x - hw); maxX = Math.max(maxX, x + hw);
    minY = Math.min(minY, y - hh); maxY = Math.max(maxY, y + hh);
    minZ = Math.min(minZ, z - hd); maxZ = Math.max(maxZ, z + hd);
  });
  if (!isFinite(minX)) return { center: [0, 0.5, 0], size: [1, 1, 1] };
  return {
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    size: [Math.max(maxX - minX, 0.2) + 0.15, Math.max(maxY - minY, 0.2) + 0.15, Math.max(maxZ - minZ, 0.2) + 0.15],
  };
}

export default function SceneObjectGroup({ object, selected, onSelect }) {
  const bounds = useMemo(() => computeBounds(object.parts), [object.parts]);

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      userData={{ objectId: object.objectId, label: object.label }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(object.objectId);
      }}
    >
      {object.parts.map((part, i) => (
        <PrimitiveMesh key={i} part={part} />
      ))}
      {selected && (
        <mesh position={bounds.center}>
          <boxGeometry args={bounds.size} />
          <meshBasicMaterial color="#e8b33d" wireframe transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}
