const express = require("express");
const router = express.Router();
const { getDefaultScene, deleteObject, clearScene } = require("../controllers/sceneController");

router.get("/default", getDefaultScene);
router.delete("/objects/:objectId", deleteObject);
router.delete("/clear", clearScene);

module.exports = router;
