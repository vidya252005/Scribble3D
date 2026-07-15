// A tiny mutable holder so ExportPanel (outside the <Canvas>) can reach the
// live three.js scene/camera/renderer that SceneViewer creates.
const threeRefs = {
  scene: null,
  camera: null,
  gl: null,
};

export default threeRefs;
