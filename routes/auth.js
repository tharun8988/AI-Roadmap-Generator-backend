const express = require("express");
const router = express.Router();

const {
    handleLogin,
    getCurrentUser
} = require("../controllers/authController");

const verifyJwt = require("../middleware/verifyJwt");

router.post("/", handleLogin);
router.get("/me", verifyJwt, getCurrentUser);

module.exports = router;