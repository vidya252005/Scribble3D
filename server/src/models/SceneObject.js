const mongoose = require("mongoose");

// A "part" is one primitive mesh (box / sphere / cylinder / cone / plane)
// that, together with the other parts of an object, makes up its geometry.
const PartSchema = new mongoose.Schema(
  {
    shape: {
      type: String,
      enum: ["box", "sphere", "cylinder", "cone", "plane", "torus"],
      required: true,
    },
    position: { type: [Number], default: [0, 0, 0] }, // x, y, z
    rotation: { type: [Number], default: [0, 0, 0] }, // radians
    scale: { type: [Number], default: [1, 1, 1] },
    // free-form per-shape dimensions, e.g. { width, height, depth } or { radius, height }
    dims: { type: mongoose.Schema.Types.Mixed, default: {} },
    color: { type: String, default: "#8a8a8a" },
    opacity: { type: Number, default: 1 },
  },
  { _id: false }
);

const SceneObjectSchema = new mongoose.Schema(
  {
    scene: { type: mongoose.Schema.Types.ObjectId, ref: "Scene", required: true, index: true },
    objectId: { type: String, required: true, index: true }, // stable client-side id (uuid)
    type: { type: String, required: true }, // e.g. "room", "man", "tree", "box"
    label: { type: String, required: true }, // human readable name shown in UI
    color: { type: String, required: true }, // primary color chosen by the agent
    prompt: { type: String, default: "" }, // the raw text prompt that produced/edited this object
    position: { type: [Number], default: [0, 0, 0] },
    rotation: { type: [Number], default: [0, 0, 0] },
    scale: { type: [Number], default: [1, 1, 1] },
    params: { type: mongoose.Schema.Types.Mixed, default: {} }, // resolved builder params
    parts: { type: [PartSchema], default: [] }, // final assembled primitive geometry
    trace: { type: [String], default: [] }, // agent step trace that produced this object
  },
  { timestamps: true }
);

module.exports = mongoose.model("SceneObject", SceneObjectSchema);
