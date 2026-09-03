const Invitation = require("../models/invitation");
const User = require("../models/user");
const Project = require("../models/project");

// Send invitation
const sendInvitation = async (req, res) => {
    try {
        const { projectId, receiverMail } = req.body;

        console.log("\n========== SEND INVITATION ==========");
        console.log("Request body:", req.body);
        console.log("req.UserInfo:", req.UserInfo);
        console.log("req.mail:", req.mail);

        if (!projectId || !receiverMail) {
            return res.status(400).json({
                message: "Project ID and receiver email are required"
            });
        }

        const senderId = req.UserInfo.id;

        console.log("Sender ID:", senderId);
        console.log("Project ID:", projectId);
        console.log("Receiver Mail:", receiverMail);

        const project = await Project.findById(projectId);

        console.log("Project found:", project);
        console.log("Project owner:", project?.owner);
        console.log("Project collaborators:", project?.collaborators);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can send invitations
        console.log("Comparing project owner and sender ID...");
        console.log("project.owner:", project.owner);
        console.log("senderId:", senderId);

        if (project.owner.toString() !== senderId.toString()) {
            return res.status(403).json({
                message: "Only the project owner can send invitations"
            });
        }

        console.log("Project owner verification passed.");

        // Find receiver by email
        const receiver = await User.findOne({
            mail: receiverMail
        });

        console.log("Receiver found:", receiver);
        console.log("Receiver ID:", receiver?._id);

        if (!receiver) {
            return res.status(404).json({
                message: "User with this email is not registered"
            });
        }

        // Owner cannot invite himself
        console.log("Checking whether owner is inviting himself...");

        if (receiver._id.toString() === senderId.toString()) {
            return res.status(400).json({
                message: "You cannot invite yourself"
            });
        }

        console.log("Self-invitation check passed.");

        // Check if already a collaborator
        console.log("Checking existing collaborators...");

        if (
            project.collaborators.some(
                id => id.toString() === receiver._id.toString()
            )
        ) {
            return res.status(409).json({
                message: "User is already a collaborator"
            });
        }

        console.log("Collaborator check passed.");

        // Check existing pending invitation
        console.log("Checking existing pending invitation...");

        const existingInvitation = await Invitation.findOne({
            project: projectId,
            receiver: receiver._id,
            status: "Pending"
        });

        console.log("Existing invitation:", existingInvitation);

        if (existingInvitation) {
            return res.status(409).json({
                message: "Invitation already sent to this user"
            });
        }

        console.log("No existing pending invitation.");

        // Create invitation
        console.log("Creating invitation...");
        console.log("Invitation data:", {
            project: projectId,
            sender: senderId,
            receiver: receiver._id
        });

        const invitation = await Invitation.create({
            project: projectId,
            sender: senderId,
            receiver: receiver._id
        });

        console.log("Invitation created:", invitation);
        console.log("========== INVITATION SUCCESS ==========\n");

        res.status(201).json({
            message: "Invitation sent successfully",
            invitation
        });

    } catch (err) {
        console.error("\n========== INVITATION ERROR ==========");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("======================================\n");

        res.status(500).json({
            message: err.message
        });
    }
};


// Get invitations received by logged-in user
const getInvitations = async (req, res) => {
    try {
        console.log("\n========== GET INVITATIONS ==========");
        console.log("req.UserInfo:", req.UserInfo);
        console.log("req.mail:", req.mail);

        const receiverId = req.UserInfo.id;

        console.log("Receiver ID:", receiverId);

        const invitations = await Invitation.find({
            receiver: receiverId
        })
        .populate("project", "title description")
        .populate("sender", "name mail")
        .sort({ createdAt: -1 });

        console.log("Invitations found:", invitations.length);
        console.log("=====================================\n");

        res.status(200).json(invitations);

    } catch (err) {
        console.error("GET INVITATIONS ERROR:", err.message);
        console.error(err.stack);

        res.status(500).json({
            message: err.message
        });
    }
};


// Accept invitation
const acceptInvitation = async (req, res) => {
    try {
        console.log("\n========== ACCEPT INVITATION ==========");
        console.log("Invitation ID:", req.params.id);
        console.log("req.UserInfo:", req.UserInfo);
        console.log("req.mail:", req.mail);

        const invitation = await Invitation.findById(req.params.id);

        console.log("Invitation found:", invitation);

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        console.log("Invitation receiver:", invitation.receiver);
        console.log("Logged-in user ID:", req.UserInfo?.id);

        // Only receiver can accept
        if (
            invitation.receiver.toString() !==
            req.UserInfo.id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to accept this invitation"
            });
        }

        if (invitation.status !== "Pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }

        console.log("Receiver verification passed.");

        const project = await Project.findById(invitation.project);

        console.log("Project found:", project);

        if (!project) {
            return res.status(404).json({
                message: "Project no longer exists"
            });
        }

        // Add receiver to collaborators
        console.log("Current collaborators:", project.collaborators);

        if (
            !project.collaborators.some(
                id => id.toString() === invitation.receiver.toString()
            )
        ) {
            project.collaborators.push(invitation.receiver);
            await project.save();

            console.log("Receiver added to collaborators.");
        }

        // Update invitation status
        invitation.status = "Accepted";
        await invitation.save();

        console.log("Invitation status changed to Accepted.");
        console.log("========== ACCEPT SUCCESS ==========\n");

        res.status(200).json({
            message: "Invitation accepted successfully"
        });

    } catch (err) {
        console.error("\n========== ACCEPT INVITATION ERROR ==========");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("============================================\n");

        res.status(500).json({
            message: err.message
        });
    }
};


// Reject invitation
const rejectInvitation = async (req, res) => {
    try {
        console.log("\n========== REJECT INVITATION ==========");
        console.log("Invitation ID:", req.params.id);
        console.log("req.UserInfo:", req.UserInfo);
        console.log("req.mail:", req.mail);

        const invitation = await Invitation.findById(req.params.id);

        console.log("Invitation found:", invitation);

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        console.log("Invitation receiver:", invitation.receiver);
        console.log("Logged-in user ID:", req.UserInfo?.id);

        // Only receiver can reject
        if (
            invitation.receiver.toString() !==
            req.UserInfo.id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to reject this invitation"
            });
        }

        if (invitation.status !== "Pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }

        console.log("Receiver verification passed.");

        invitation.status = "Rejected";
        await invitation.save();

        console.log("Invitation status changed to Rejected.");
        console.log("========== REJECT SUCCESS ==========\n");

        res.status(200).json({
            message: "Invitation rejected successfully"
        });

    } catch (err) {
        console.error("\n========== REJECT INVITATION ERROR ==========");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("=============================================\n");

        res.status(500).json({
            message: err.message
        });
    }
};


module.exports = {
    sendInvitation,
    getInvitations,
    acceptInvitation,
    rejectInvitation
};