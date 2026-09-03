const validateRoadmap = (roadmap) => {

    if (!roadmap || typeof roadmap !== "object") {
        return {
            valid: false,
            error: "Roadmap must be an object",
            path: "roadmap"
        };
    }

    if (!Array.isArray(roadmap.milestones)) {
        return {
            valid: false,
            error: "Milestones must be an array",
            path: "milestones"
        };
    }

    if (roadmap.milestones.length === 0) {
        return {
            valid: false,
            error: "Roadmap must contain at least one milestone",
            path: "milestones"
        };
    }

    const milestoneTitles = new Set();

    for (let i = 0; i < roadmap.milestones.length; i++) {

        const milestone = roadmap.milestones[i];

        if (!milestone || typeof milestone !== "object") {
            return {
                valid: false,
                error: "Milestone must be an object",
                path: `milestones[${i}]`
            };
        }

        if (
            typeof milestone.title !== "string" ||
            milestone.title.trim() === ""
        ) {
            return {
                valid: false,
                error: "Milestone title is required",
                path: `milestones[${i}].title`
            };
        }

        const milestoneTitle = milestone.title.trim().toLowerCase();

        if (milestoneTitles.has(milestoneTitle)) {
            return {
                valid: false,
                error: "Duplicate milestone title",
                path: `milestones[${i}].title`
            };
        }

        milestoneTitles.add(milestoneTitle);

        if (typeof milestone.description !== "string") {
            return {
                valid: false,
                error: "Milestone description must be a string",
                path: `milestones[${i}].description`
            };
        }

        if (
            typeof milestone.order !== "number" ||
            milestone.order !== i + 1
        ) {
            return {
                valid: false,
                error: `Milestone order must be ${i + 1}`,
                path: `milestones[${i}].order`
            };
        }

        if (!Array.isArray(milestone.tasks)) {
            return {
                valid: false,
                error: "Tasks must be an array",
                path: `milestones[${i}].tasks`
            };
        }

        if (milestone.tasks.length === 0) {
            return {
                valid: false,
                error: "Milestone must contain at least one task",
                path: `milestones[${i}].tasks`
            };
        }

        const taskTitles = new Set();

        for (let j = 0; j < milestone.tasks.length; j++) {

            const task = milestone.tasks[j];

            if (!task || typeof task !== "object") {
                return {
                    valid: false,
                    error: "Task must be an object",
                    path: `milestones[${i}].tasks[${j}]`
                };
            }

            if (
                typeof task.title !== "string" ||
                task.title.trim() === ""
            ) {
                return {
                    valid: false,
                    error: "Task title is required",
                    path: `milestones[${i}].tasks[${j}].title`
                };
            }

            const taskTitle = task.title.trim().toLowerCase();

            if (taskTitles.has(taskTitle)) {
                return {
                    valid: false,
                    error: "Duplicate task title",
                    path: `milestones[${i}].tasks[${j}].title`
                };
            }

            taskTitles.add(taskTitle);

            if (typeof task.description !== "string") {
                return {
                    valid: false,
                    error: "Task description must be a string",
                    path: `milestones[${i}].tasks[${j}].description`
                };
            }

            if (
                typeof task.order !== "number" ||
                task.order !== j + 1
            ) {
                return {
                    valid: false,
                    error: `Task order must be ${j + 1}`,
                    path: `milestones[${i}].tasks[${j}].order`
                };
            }
        }
    }

    return {
        valid: true,
        error: null,
        path: null
    };
};

module.exports = validateRoadmap;