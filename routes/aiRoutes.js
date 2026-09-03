const express = require("express");

const router = express.Router();

const { generateProjectRoadmap, saveApprovedRoadmap } = require("../controllers/aiController");

router.post("/generate", generateProjectRoadmap);
router.post("/save", saveApprovedRoadmap);

module.exports = router;