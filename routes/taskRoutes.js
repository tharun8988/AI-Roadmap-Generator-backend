const express = require("express");

const router = express.Router();

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

router.post("/milestones/:milestoneId/tasks", createTask);

router.get("/milestones/:milestoneId/tasks", getTasks);

router.patch("/tasks/:taskId", updateTask);

router.delete("/tasks/:taskId", deleteTask);

module.exports = router;