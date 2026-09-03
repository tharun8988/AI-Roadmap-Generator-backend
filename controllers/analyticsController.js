const mongoose = require("mongoose");

const Project = require("../models/project");
const { getProjectAnalytics } = require("../services/analyticsService");

const getAnalytics = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Validate Project ID
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Project ID"
            });
        }

        // Check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isAuthorized = project.owner.equals(req.UserInfo.id) || 
            (project.collaborators && project.collaborators.some(id => id.equals(req.UserInfo.id)));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Get project analytics
        const analytics = await getProjectAnalytics(projectId);

        return res.status(200).json({
            success: true,
            analytics
        });

    } catch (err) {

        const statusCode = err.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    getAnalytics
};