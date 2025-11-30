const express = require("express");
const formController = require("../controllers/form.controller");
const submissionController = require("../controllers/submission.controller");
const { validateRequest } = require("../middleware/validateRequest");
const { submissionSchema } = require("../validators/submissionSchemas");

const router = express.Router();

router.get("/", formController.listPublicForms);
router.get("/:formId", formController.getPublicForm);
router.post(
  "/:formId/submissions",
  validateRequest(submissionSchema),
  submissionController.submitForm
);

module.exports = router;

