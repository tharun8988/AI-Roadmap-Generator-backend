const mongoose = require("mongoose");

const Project = require("../models/project");
const Milestone = require("../models/Milestone");
const Task = require("../models/task");

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


const createTask = async (req, res) => {
    try {
        const { milestoneId } = req.params;
        const { title, description, order, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Milestone ID"
            });
        }

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        if (order !== undefined) {
            if (!Number.isInteger(order) || order < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Order must be a positive integer"
                });
            }
        }

        const existingMilestone = await Milestone.findById(milestoneId);

        if (!existingMilestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        const existingProject = await Project.findById(
            existingMilestone.project
        );

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isAuthorized = existingProject.owner.equals(req.UserInfo.id) || 
            (existingProject.collaborators && existingProject.collaborators.some(id => id.equals(req.UserInfo.id)));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const duplicateTask = await Task.findOne({
            milestone: milestoneId,
            title: {
                $regex: new RegExp(
                    `^${escapeRegex(title.trim())}$`,
                    "i"
                )
            }
        });

        if (duplicateTask) {
            return res.status(409).json({
                success: false,
                message: "Task with same title already exists"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || "",
            order: order || 1,
            status: status?.trim() || "Not Started",
            milestone: milestoneId
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const { milestoneId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Milestone ID"
            });
        }

        const existingMilestone = await Milestone.findById(milestoneId);

        if (!existingMilestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        const existingProject = await Project.findById(
            existingMilestone.project
        );

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isAuthorized = existingProject.owner.equals(req.UserInfo.id) || 
            (existingProject.collaborators && existingProject.collaborators.some(id => id.equals(req.UserInfo.id)));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const tasks = await Task.find({
            milestone: milestoneId
        }).sort({
            order: 1
        });

        return res.status(200).json({
            success: true,
            tasks
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, order, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Task ID"
            });
        }

        const existingTask = await Task.findById(taskId);

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const existingMilestone = await Milestone.findById(
            existingTask.milestone
        );

        if (!existingMilestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        const existingProject = await Project.findById(
            existingMilestone.project
        );

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isAuthorized = existingProject.owner.equals(req.UserInfo.id) || 
            (existingProject.collaborators && existingProject.collaborators.some(id => id.equals(req.UserInfo.id)));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (
            title &&
            title.trim().toLowerCase() !==
            existingTask.title.toLowerCase()
        ) {
            const duplicateTask = await Task.findOne({
                milestone: existingMilestone._id,
                title: {
                    $regex: new RegExp(
                        `^${escapeRegex(title.trim())}$`,
                        "i"
                    )
                },
                _id: { $ne: taskId }
            });

            if (duplicateTask) {
                return res.status(409).json({
                    success: false,
                    message: "Task with same title already exists"
                });
            }

            existingTask.title = title.trim();
        }

        if (description !== undefined) {
            existingTask.description = description?.trim() || "";
        }

        if (status !== undefined) {
            existingTask.status = status?.trim();
        }

        if (order !== undefined) {
            if (!Number.isInteger(order) || order < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Order must be a positive integer"
                });
            }

            existingTask.order = order;
        }

        await existingTask.save();

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: existingTask
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Task ID"
            });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const existingMilestone = await Milestone.findById(
            task.milestone
        );

        if (!existingMilestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        const existingProject = await Project.findById(
            existingMilestone.project
        );

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isAuthorized = existingProject.owner.equals(req.UserInfo.id) || 
            (existingProject.collaborators && existingProject.collaborators.some(id => id.equals(req.UserInfo.id)));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await task.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};