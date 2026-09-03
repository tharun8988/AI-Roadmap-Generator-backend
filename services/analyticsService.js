const Project = require("../models/project");
const Milestone = require("../models/milestone");
const Task = require("../models/task");

const calculateProgress = require("../utils/calculateProgress");

const getProjectAnalytics = async (projectId) => {
    // 1. Check project
    const project = await Project.findById(projectId);

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Get all milestones belonging to project
    const milestones = await Milestone.find({
        project: projectId
    }).sort({
        order: 1
    });

    // 3. Get all tasks belonging to those milestones
    const milestoneIds = milestones.map(
        milestone => milestone._id
    );

    const tasks = await Task.find({
        milestone: { $in: milestoneIds }
    }).sort({
        order: 1
    });

    // 4. Overall task statistics
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const inProgressTasks = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const notStartedTasks = tasks.filter(
        task => task.status === "Not Started"
    ).length;

    // 5. Overall project progress
    const progress = calculateProgress(tasks);

    // 6. Milestone analytics
    const milestoneAnalytics = milestones.map(milestone => {

        const milestoneTasks = tasks.filter(task =>
            task.milestone.equals(milestone._id)
        );

        const milestoneCompletedTasks = milestoneTasks.filter(
            task => task.status === "Completed"
        ).length;

        const milestoneInProgressTasks = milestoneTasks.filter(
            task => task.status === "In Progress"
        ).length;

        const milestoneNotStartedTasks = milestoneTasks.filter(
            task => task.status === "Not Started"
        ).length;

        return {
            id: milestone._id,
            title: milestone.title,
            order: milestone.order,

            totalTasks: milestoneTasks.length,

            completedTasks: milestoneCompletedTasks,

            inProgressTasks: milestoneInProgressTasks,

            notStartedTasks: milestoneNotStartedTasks,

            progress: calculateProgress(milestoneTasks)
        };
    });

    // 7. Milestone statistics
    const totalMilestones = milestones.length;

    const completedMilestones = milestoneAnalytics.filter(
        milestone => milestone.progress === 100
    ).length;

    const inProgressMilestones = milestoneAnalytics.filter(
        milestone =>
            milestone.progress > 0 &&
            milestone.progress < 100
    ).length;

    const notStartedMilestones = milestoneAnalytics.filter(
        milestone => milestone.progress === 0
    ).length;

    return {
        project: {
            id: project._id,
            title: project.title,
            status: project.status
        },

        tasks: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            notStarted: notStartedTasks
        },

        milestones: {
            total: totalMilestones,
            completed: completedMilestones,
            inProgress: inProgressMilestones,
            notStarted: notStartedMilestones
        },

        progress,

        milestoneAnalytics
    };
};

module.exports = {
    getProjectAnalytics
};
