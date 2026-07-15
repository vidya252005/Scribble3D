import React from "react";

export default function PrimitiveMesh({ part }) {
  const { shape, dims = {}, position = [0, 0, 0], rotation = [0, 0, 0], color = "#8a8a8a", opacity = 1 } = part;

  let geometry = null;
  switch (shape) {
    case "box":
      geometry = <boxGeometry args={[dims.width || 1, dims.height || 1, dims.depth || 1]} />;
      break;
    case "sphere":
      geometry = <sphereGeometry args={[dims.radius || 0.5, 24, 18]} />;
      break;
    case "cylinder":
      geometry = (
        <cylinderGeometry
          args={[dims.radiusTop ?? 0.5, dims.radiusBottom ?? 0.5, dims.height || 1, 20]}
        />
      );
      break;
    case "cone":
      geometry = <coneGeometry args={[dims.radiusBottom ?? 0.5, dims.height || 1, 20]} />;
      break;
    case "plane":
      geometry = <planeGeometry args={[dims.width || 1, dims.height || 1]} />;
      break;
    case "torus":
      geometry = <torusGeometry args={[dims.radius || 0.5, dims.tube || 0.15, 12, 24]} />;
      break;
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.75} metalness={0.05} />
    </mesh>
  );
}
