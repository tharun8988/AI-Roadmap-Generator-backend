const express = require("express");

const router = express.Router();

const {
    createMilestone,
    getMilestones,
    updateMilestone,
    deleteMilestone
} = require("../controllers/milestoneController");

router.post("/", createMilestone);

router.get("/:projectId", getMilestones);

router.patch("/:milestoneId", updateMilestone);

router.delete("/:milestoneId", deleteMilestone);

module.exports = router;