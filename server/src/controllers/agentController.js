const { v4: uuidv4 } = require("uuid");
const Scene = require("../models/Scene");
const SceneObject = require("../models/SceneObject");
const { runAgent } = require("../agent/planner");

// POST /api/agent/generate
// body: { prompt: string, targetObjectId?: string }
// If targetObjectId is provided AND the prompt reads as an edit, the agent
// edits that object in place. Otherwise a brand-new object is created and
// added to the same persistent scene.
async function generate(req, res) {
  try {
    const { prompt, targetObjectId } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }

    let scene = await Scene.findOne({ name: "Late Night Lab" });
    if (!scene) scene = await Scene.create({ name: "Late Night Lab" });

    let targetObject = null;
    if (targetObjectId) {
      targetObject = await SceneObject.findOne({ scene: scene._id, objectId: targetObjectId });
    }

    const existingObjectCount = await SceneObject.countDocuments({ scene: scene._id });

    const result = await runAgent({ prompt, targetObject, existingObjectCount });

    let doc;
    if (result.objectId) {
      // edit path -> update in place
      doc = await SceneObject.findOneAndUpdate(
        { scene: scene._id, objectId: result.objectId },
        {
          type: result.type,
          label: result.label,
          color: result.color,
          position: result.position,
          rotation: result.rotation,
          scale: result.scale,
          params: result.params,
          parts: result.parts,
          prompt: result.prompt,
          trace: result.trace,
        },
        { new: true }
      );
    } else {
      // create path -> new document
      doc = await SceneObject.create({
        scene: scene._id,
        objectId: uuidv4(),
        type: result.type,
        label: result.label,
        color: result.color,
        position: result.position,
        rotation: result.rotation,
        scale: result.scale,
        params: result.params,
        parts: result.parts,
        prompt: result.prompt,
        trace: result.trace,
      });
    }

    res.json({ object: doc, trace: result.trace });
  } catch (err) {
    console.error("[agentController.generate]", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { generate };
