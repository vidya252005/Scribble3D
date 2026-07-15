const Scene = require("../models/Scene");
const SceneObject = require("../models/SceneObject");

// Gets (or lazily creates) the single persistent "Late Night Lab" scene and
// returns it together with every object currently placed in it.
async function getDefaultScene(req, res) {
  try {
    let scene = await Scene.findOne({ name: "Late Night Lab" });
    if (!scene) scene = await Scene.create({ name: "Late Night Lab" });
    const objects = await SceneObject.find({ scene: scene._id }).sort({ createdAt: 1 });
    res.json({ scene, objects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteObject(req, res) {
  try {
    const { objectId } = req.params;
    await SceneObject.deleteOne({ objectId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function clearScene(req, res) {
  try {
    const scene = await Scene.findOne({ name: "Late Night Lab" });
    if (scene) await SceneObject.deleteMany({ scene: scene._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getDefaultScene, deleteObject, clearScene };
