const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        ],

        status: {
            type: String,
            enum: ["Active", "Completed", "Archived"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);