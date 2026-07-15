require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const sceneRoutes = require("./routes/scenes");
const agentRoutes = require("./routes/agent");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "scribble3d-server" }));
app.use("/api/scenes", sceneRoutes);
app.use("/api/agent", agentRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] Scribble3D API listening on port ${PORT}`));
});
