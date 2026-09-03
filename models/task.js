const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        order: {
            type: Number,
            required: true,
            default: 1
        },

        status: {
            type: String,
            enum: ["Not Started", "In Progress", "Completed"],
            default: "Not Started"
        },

        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Milestone",
            required: true
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index(
    { milestone: 1, title: 1 },
    { unique: true }
);

module.exports = mongoose.model("Task", taskSchema);