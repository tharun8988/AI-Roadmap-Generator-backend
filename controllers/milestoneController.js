const mongoose = require("mongoose");

const Project = require("../models/project");
const Milestone = require("../models/milestone");

const createMilestone = async (req, res) => {

    try {

        const { title, description, status, order, project } = req.body;

        if (!title?.trim() || !project?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and project are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(project)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        if (order && (!Number.isInteger(order) || order < 1)) {
            return res.status(400).json({
                success: false,
                message: "Order must be a positive integer"
            });
        }

        const existingProject = await Project.findById(project);

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

        const escapeRegex = (text) => {
            return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        };

        const duplicateMilestone = await Milestone.findOne({
            project,
            title: {
            $regex: new RegExp(
                `^${escapeRegex(title.trim())}$`,
                "i"
            )
        }
        });

        if (duplicateMilestone) {
            return res.status(409).json({
                success: false,
                message: "Milestone already exists"
            });
        }

        const milestone = await Milestone.create({
            title: title?.trim(),
            description: description?.trim() || "",
            order,
            project
        });

        return res.status(201).json({
            success: true,
            message: "Milestone created successfully",
            milestone
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getMilestones = async (req, res) => {
    try{
        const {projectId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const existingProject = await Project.findById(projectId);

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

        const milestones = await Milestone.find({
            project: projectId
        }).sort({order:1});

        return res.status(200).json({
            success:true,
            milestones
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const updateMilestone = async (req, res) => {
    try{
        const {milestoneId} = req.params;
        const { title, description, order, status } = req.body;

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

        const existingProject = await Project.findById(existingMilestone.project);

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

        const escapeRegex = (text) => {
            return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        };

        if (
            title &&
            title.trim().toLowerCase() !==
                existingMilestone.title.toLowerCase()
        ) {
            const duplicateMilestone = await Milestone.findOne({
                project: existingProject._id,
                title: {
                    $regex: new RegExp(
                        `^${escapeRegex(title.trim())}$`,
                        "i"
                    ),
                },
                _id: { $ne: milestoneId },
            });

            if (duplicateMilestone) {
                return res.status(409).json({
                    success: false,
                    message: "Milestone with same title already exists",
                });
            }

            existingMilestone.title = title.trim();
        }

        if (description !== undefined) {
            existingMilestone.description = description?.trim() || "";
        }

        if (status !== undefined) {
            existingMilestone.status = status?.trim();
        }
        
        if (order !== undefined) {
            if (!Number.isInteger(order) || order < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Order must be a positive integer"
                });
            }
            existingMilestone.order = order;
        }

        await existingMilestone.save();

        return res.status(200).json({
            success: true,
            message: "Milestone updated successfully",
            milestone: existingMilestone
        });
        
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const deleteMilestone = async (req, res) => {

    try {

        const { milestoneId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Milestone ID"
            });
        }

        const milestone = await Milestone.findById(milestoneId);

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found."
            });
        }

        const existingProject = await Project.findById(milestone.project);

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

        await Milestone.findByIdAndDelete(milestoneId);

        return res.status(200).json({
            success: true,
            message: "Milestone deleted successfully."
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


module.exports = {
    createMilestone,
    getMilestones,
    updateMilestone,
    deleteMilestone
};
