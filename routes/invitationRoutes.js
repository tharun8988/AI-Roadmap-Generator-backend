const express = require("express");
const router = express.Router();

const {
    sendInvitation,
    getInvitations,
    acceptInvitation,
    rejectInvitation
} = require("../controllers/invitationController");

const verifyJwt = require("../middleware/verifyJwt");

// All invitation routes require authentication
router.use(verifyJwt);

// Send invitation
router.post("/", sendInvitation);

// Get received invitations
router.get("/", getInvitations);

// Accept invitation
router.patch("/:id/accept", acceptInvitation);

// Reject invitation
router.patch("/:id/reject", rejectInvitation);

module.exports = router;