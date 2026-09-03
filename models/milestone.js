const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            default: ""
        },

        order: {
            type: Number,
            required: true,
            default: 1
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        
        status: {
            type: String,
            enum: ["Not Started", "In Progress", "Completed"],
            default: "Not Started"
        }
    },

    {
        timestamps: true
    },

)

    milestoneSchema.index
    (
        {project: 1, title: 1},
        {unique: true}
    )

module.exports = mongoose.models.Milestone || mongoose.model("Milestone", milestoneSchema);