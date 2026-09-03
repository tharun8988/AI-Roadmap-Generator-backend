const Project = require("../models/project");

// MODIFIED: Import User model
const User = require("../models/user");

const mongoose = require("mongoose");

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    // MODIFIED:
    // req.mail comes from verifyJwt middleware
    // Find the logged-in user using that email
    const user = await User.findOne({
      mail: req.mail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const existingProject = await Project.findOne({
      owner: user._id,

      title: {
        $regex: new RegExp(
          `^${escapeRegex(title.trim())}$`,
          "i"
        ),
      },
    });

    if (existingProject) {
      return res.status(409).json({
        message: "Project with same title already exists",
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),

      // MODIFIED:
      // Project owner should be the User's MongoDB _id
      owner: user._id,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    // MODIFIED:
    // req.user does not exist in verifyJwt
    // We get the user using req.mail
    const user = await User.findOne({
      mail: req.mail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const projects = await Project.find({
      $or: [
        { owner: user._id },
        { collaborators: user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    // MODIFIED:
    // Find logged-in user using req.mail
    const user = await User.findOne({
      mail: req.mail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const project = await Project.findOne({
      _id: id,
      $or: [
        { owner: user._id },
        { collaborators: user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    // MODIFIED:
    // Find logged-in user using req.mail
    const user = await User.findOne({
      mail: req.mail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const project = await Project.findOne({
      _id: id,

      // MODIFIED:
      // Changed req.user.id to user._id
      owner: user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check duplicate title only if title is being changed
    if (
      title &&
      title.trim().toLowerCase() !== project.title.toLowerCase()
    ) {
      const existingProject = await Project.findOne({
        // MODIFIED:
        // Changed req.user.id to user._id
        owner: user._id,

        title: {
          $regex: new RegExp(
            `^${escapeRegex(title.trim())}$`,
            "i"
          ),
        },

        _id: { $ne: id },
      });

      if (existingProject) {
        return res.status(409).json({
          message: "Project with same title already exists",
        });
      }

      project.title = title.trim();
    }

    if (description) {
      project.description = description.trim();
    }

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    // MODIFIED:
    // Find logged-in user using req.mail
    const user = await User.findOne({
      mail: req.mail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const project = await Project.findOne({
      _id: id,

      // MODIFIED:
      // Changed req.user.id to user._id
      owner: user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};