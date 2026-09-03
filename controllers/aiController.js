const Project = require("../models/project");
const Milestone = require("../models/milestone");
const Task = require("../models/task");
const mongoose = require('mongoose')

const { generateRoadmap } = require("../services/aiService");
const validateRoadmap = require("../utils/validateRoadmap");

const generateProjectRoadmap = async (req, res) => {
    try {
        const { projectId } = req.body;

        // 1. Check projectId
        if (!projectId) {
            return res.status(400).json({
                message: "Project ID is required"
            });
        }

        // 2. Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // 3. Generate roadmap using AI
        const roadmap = await generateRoadmap(
            project.title,
            project.description
        );

        // 4. Validate AI response
        const validation = validateRoadmap(roadmap);

        if (!validation.valid) {
            return res.status(500).json({
                message: "AI generated an invalid roadmap",
                error: validation.error,
                path: validation.path
            });
        }

        // 5. Return roadmap
        return res.status(200).json({
            message: "Roadmap generated successfully",
            roadmap
        });

    } catch (error) {
        console.error("AI roadmap generation error:", error);

        return res.status(500).json({
            message: "Failed to generate roadmap"
        });
    }
};

const saveApprovedRoadmap = async (req, res) => {
    try {
        const { projectId, roadmap } = req.body;

        // 1. Validate project ID
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        // 2. Validate roadmap again
        const validation = validateRoadmap(roadmap);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: "Invalid roadmap",
                error: validation.error,
                path: validation.path
            });
        }

        // 3. Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // 4. Check ownership
        if (!project.owner.equals(req.UserInfo.id)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // 5. Create milestones and tasks
        const savedMilestones = [];

        for (const milestoneData of roadmap.milestones) {

            const milestone = await Milestone.create({
                title: milestoneData.title.trim(),
                description: milestoneData.description.trim(),
                order: milestoneData.order,
                project: projectId
            });

            const savedTasks = [];

            for (const taskData of milestoneData.tasks) {

                const task = await Task.create({
                    title: taskData.title.trim(),
                    description: taskData.description.trim(),
                    order: taskData.order,
                    milestone: milestone._id
                });

                savedTasks.push(task);
            }

            savedMilestones.push({
                milestone,
                tasks: savedTasks
            });
        }

        return res.status(201).json({
            success: true,
            message: "Roadmap saved successfully",
            roadmap: savedMilestones
        });

    } catch (error) {

        console.error("Save roadmap error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    generateProjectRoadmap,
    saveApprovedRoadmap
};