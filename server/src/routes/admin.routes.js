const express = require("express");
const {
  createFormSchema,
  updateFormSchema,
  fieldSchema,
  reorderFieldsSchema,
} = require("../validators/formSchemas");
const {
  submissionSchema,
  submissionsQuerySchema,
} = require("../validators/submissionSchemas");
const { validateRequest } = require("../middleware/validateRequest");
const formController = require("../controllers/form.controller");
const submissionController = require("../controllers/submission.controller");

const router = express.Router();


router.get("/forms", formController.listForms);
router.post("/forms", validateRequest(createFormSchema), formController.createForm);
router.get("/forms/:formId", formController.getForm);
router.patch(
  "/forms/:formId",
  validateRequest(updateFormSchema),
  formController.updateForm
);
router.delete("/forms/:formId", formController.deleteForm);

router.post(
  "/forms/:formId/fields",
  validateRequest(fieldSchema),
  formController.addField
);
router.patch(
  "/forms/:formId/fields/:fieldName",
  validateRequest(fieldSchema),
  formController.updateField
);
router.delete("/forms/:formId/fields/:fieldName", formController.removeField);
router.post(
  "/forms/:formId/fields/reorder",
  validateRequest(reorderFieldsSchema),
  formController.reorderFields
);

router.post(
  "/forms/:formId/submissions",
  validateRequest(submissionSchema),
  submissionController.submitForm
);
router.get(
  "/forms/:formId/submissions",
  validateRequest(submissionsQuerySchema, "query"),
  submissionController.listSubmissions
);
router.get(
  "/submissions",
  validateRequest(submissionsQuerySchema, "query"),
  submissionController.listSubmissions
);

module.exports = router;

