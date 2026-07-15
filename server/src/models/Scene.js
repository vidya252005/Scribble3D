const mongoose = require("mongoose");

const SceneSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Late Night Lab" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scene", SceneSchema);
