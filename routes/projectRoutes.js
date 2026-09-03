const express = require("express");
const router = express.Router();



const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const verifyJWT = require("../middleware/verifyJwt");

router.use(verifyJWT);

router.route("/")
  .post(createProject)
  .get(getProjects);

router.route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
