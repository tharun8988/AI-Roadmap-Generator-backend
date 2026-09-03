const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

invitationSchema.index(
    { project: 1, receiver: 1, status: 1 },
    { unique: true }
);

module.exports = mongoose.model("Invitation", invitationSchema);