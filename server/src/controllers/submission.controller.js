const Form = require("../models/Form.model");
const Submission = require("../models/Submission.model");
const { validateSubmissionPayload } = require("../utils/validateSubmissionPayload");

// Utility to ensure form exists
async function ensureForm(formId) {
  const form = await Form.findById(formId);
  if (!form) {
    const error = new Error("Form not found");
    error.statusCode = 404;
    throw error;
  }
  return form;
}

// ========================
// Submit Form
// ========================
const submitForm = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;

    const form = await ensureForm(req.params.formId);

    const sanitizedAnswers = validateSubmissionPayload(
      form,
      payload.answers || {}
    );

    const submission = await Submission.create({
      formId: form._id,
      formVersion: form.version,
      answers: sanitizedAnswers,
      schemaSnapshot: form.fields,
      meta: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        submittedBy: payload.metadata?.submittedBy,
        context: payload.metadata?.context,
      },
    });

    return res.status(201).json({
      id: submission._id.toString(),
      formId: submission.formId.toString(),
      submittedAt: submission.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// List Submissions
// ========================
const listSubmissions = async (req, res, next) => {
  try {
    const { page = "1", pageSize = "20", formId: queryFormId } =
      req.validatedQuery ?? req.query;

    const pageNumber = Number(page);
    const limit = Math.min(Number(pageSize), 100);
    const skip = (pageNumber - 1) * limit;

    const query = {};

    if (req.params.formId) {
      query.formId = req.params.formId;
    } else if (queryFormId) {
      query.formId = queryFormId;
    }

    const [items, total] = await Promise.all([
      Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments(query),
    ]);

    return res.json({
      page: pageNumber,
      pageSize: limit,
      total,
      items: items.map((item) => ({
        id: item._id.toString(),
        formId: item.formId.toString(),
        formVersion: item.formVersion,
        answers: item.answers,
        submittedAt: item.createdAt,
        meta: item.meta,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitForm, listSubmissions };
