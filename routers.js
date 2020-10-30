const express = require("express");
const Actions = require("./data/helpers/actionModel.js");
const Projects = require("./data/helpers/projectModel.js");
const router = express.Router();

// Error Middleware
router.use((err, req, res, next) => {
  console.log("ERR", err);
  res.status(500).json({ message: err.message });
});

// Custom Middleware
// Validates Project's ID - WORKS
function validateProjectId(req, res, next) {
  Projects.get(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).json({ message: "Invalid Project ID" });
      } else {
        res.id = data;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      next({ code: 500, message: "Crashed on validating Project ID" });
    });
}

// Validates Action's ID
function validateActionId(req, res, next) {
  Actions.get(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).json({ message: "Invalid Action ID" });
      } else {
        res.id = data;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      next({ code: 500, message: "Crashed on validating Action ID" });
    });
}

// Validates a Project's Body Info - WORKS
function validateProjectBody(req, res, next) {
  if (!req.body) {
    res.status(400).json({
      message: "Missing project data",
    });
  } else if (!req.body.name || !req.body.description) {
    res.status(400).json({
      message: "Missing required project name and/or description",
    });
  } else {
    next();
  }
}

// Validates Action's Body Info - WORKS
function validateActionBody(req, res, next) {
  if (!req.body) {
    res.status(400).json({
      message: "Missing action data",
    });
  } else if (!req.body.project_id || !req.body.description || !req.body.notes) {
    res.status(400).json({
      message: "Missing required project_id, description and/or notes.",
    });
  } else {
    next();
  }
}

// Endpoints

// GET
// Get all projects - WORKS
router.get("/projects", (req, res, next) => {
  Projects.get()
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => {
      console.log(err);
      next({ code: 500, message: "Crash on getting projects" });
    });
});

// Get all actions - WORKS
router.get("/actions", (req, res, next) => {
  Actions.get()
    .then((actions) => {
      res.status(200).json(actions);
    })
    .catch((err) => {
      console.log(err);
      next({ code: 500, message: "Crash on getting actions" });
    });
});

// Get all actions for a project - WORKS
router.get("/projects/:id/actions", validateProjectId, (req, res, next) => {
  Projects.getProjectActions(req.params.id)
    .then((actions) => {
      res.status(200).json({ actions });
    })
    .catch((err) => {
      console.log(err);
      next({ code: 500, message: "Crash on getting actions for a project" });
    });
});

// POST
// Post a new project - WORKS
router.post("/projects", validateProjectBody, (req, res, next) => {
  Projects.insert(req.body).then((newProject) => {
    res.status(201).json(newProject);
  });
});

// Post a new action for a project - WORKS
// (bonus feature? don't need to specify project_id in action body)
router.post(
  "/projects/:id/actions",
  validateActionBody,
  validateProjectId,
  (req, res, next) => {
    Actions.insert({ ...req.body, project_id: req.params.id }).then(
      (newAction) => {
        res.status(201).json({ newAction });
      }
    );
  }
);

// UPDATE
// Update a project - WORKS
router.put(
  "/projects/:id",
  validateProjectBody,
  validateProjectId,
  (req, res, next) => {
    Projects.update(req.params.id, req.body).then((updatedProject) => {
      res.status(200).json({ updatedProject });
    });
  }
);
// Update an action for a project

// DELETE
// Delete a project - WORKS
router.delete("/projects/:id", validateProjectId, (req, res, next) => {
  Projects.remove(req.params.id).then((numDeleted) =>
    res.status(200).json({
      message: `Project deleted (number of deleted projects: ${numDeleted})`,
    })
  );
});

// Delete an action for a project

module.exports = router;
