const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) {
        return 0;
    }

    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    ).length;

    return Math.round((completedTasks / tasks.length) * 100);
};

module.exports = calculateProgress;