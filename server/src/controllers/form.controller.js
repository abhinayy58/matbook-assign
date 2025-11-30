const Form = require("../models/Form.model");
const Submission = require("../models/Submission.model");

const {
  normalizeFields,
  assertUniqueNames,
  sortFieldsInPlace,
  findFieldByName,
  removeFieldByName,
  applyReorder,
} = require("../utils/fieldUtils");

// ------------------------------
// Helpers
// ------------------------------

function cloneAndSortFields(fields) {
  const clone = JSON.parse(JSON.stringify(fields || []));
  sortFieldsInPlace(clone);
  return clone;
}

function formatFormResponse(formDoc) {
  return {
    id: formDoc._id.toString(),
    title: formDoc.title,
    description: formDoc.description,
    version: formDoc.version,
    fields: cloneAndSortFields(formDoc.fields),
    createdAt: formDoc.createdAt,
    updatedAt: formDoc.updatedAt,
  };
}

function prepareFields(fields = []) {
  const normalized = normalizeFields(fields);
  assertUniqueNames(normalized);
  sortFieldsInPlace(normalized);
  return normalized;
}

async function ensureForm(formId) {
  const form = await Form.findById(formId);
  if (!form) {
    const error = new Error("Form not found");
    error.statusCode = 404;
    throw error;
  }
  return form;
}

// ------------------------------
// Controllers
// ------------------------------

const listForms = async (req, res, next) => {
  try {
    const forms = await Form.find({ isArchived: false }).sort({
      updatedAt: -1,
    });
    res.json(forms.map((formDoc) => formatFormResponse(formDoc)));
  } catch (error) {
    next(error);
  }
};

const getForm = async (req, res, next) => {
  try {
    const form = await ensureForm(req.params.formId);
    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const listPublicForms = async (_req, res, next) => {
  try {
    const forms = await Form.find({ isArchived: false }).select(
      "title description updatedAt"
    );
    res.json(
      forms.map((form) => ({
        id: form._id.toString(),
        title: form.title,
        description: form.description,
        updatedAt: form.updatedAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getPublicForm = async (req, res, next) => {
  try {
    const form = await ensureForm(req.params.formId);
    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const createForm = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;
    const fields = prepareFields(payload.fields);

    const form = await Form.create({
      title: payload.title,
      description: payload.description ?? "",
      fields,
    });

    res.status(201).json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const updateForm = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;
    const form = await ensureForm(req.params.formId);

    if (payload.title !== undefined) {
      form.title = payload.title;
    }

    if (payload.description !== undefined) {
      form.description = payload.description;
    }

    if (payload.fields) {
      form.fields = prepareFields(payload.fields);
      form.version += 1;
      form.markModified("fields");
    }

    await form.save();
    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const deleteForm = async (req, res, next) => {
  try {
    const form = await ensureForm(req.params.formId);

    await Submission.deleteMany({ formId: form._id });
    await form.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addField = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;
    const form = await ensureForm(req.params.formId);

    const normalizedField = prepareFields([payload])[0];

    if (findFieldByName(form.fields, normalizedField.name)) {
      const error = new Error(
        `Field "${normalizedField.name}" already exists in the form`
      );
      error.statusCode = 400;
      throw error;
    }

    form.fields.push(normalizedField);
    sortFieldsInPlace(form.fields);
    form.version += 1;
    form.markModified("fields");
    await form.save();

    res.status(201).json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const updateField = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;
    const { fieldName } = req.params;
    const form = await ensureForm(req.params.formId);

    const normalizedField = prepareFields([payload])[0];

    if (normalizedField.name !== fieldName) {
      const error = new Error(
        "Field name in payload must match the URL parameter"
      );
      error.statusCode = 400;
      throw error;
    }

    const target = findFieldByName(form.fields, fieldName);
    if (!target) {
      const error = new Error("Field not found");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(target.field, normalizedField);

    sortFieldsInPlace(form.fields);
    form.version += 1;
    form.markModified("fields");
    await form.save();

    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const removeField = async (req, res, next) => {
  try {
    const { fieldName } = req.params;
    const form = await ensureForm(req.params.formId);

    const deleted = removeFieldByName(form.fields, fieldName);
    if (!deleted) {
      const error = new Error("Field not found");
      error.statusCode = 404;
      throw error;
    }

    form.version += 1;
    form.markModified("fields");
    await form.save();

    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

const reorderFields = async (req, res, next) => {
  try {
    const payload = req.validatedBody ?? req.body;
    const form = await ensureForm(req.params.formId);

    applyReorder(form.fields, payload.order);

    form.version += 1;
    form.markModified("fields");
    await form.save();

    res.json(formatFormResponse(form));
  } catch (error) {
    next(error);
  }
};

// ------------------------------
module.exports = {
  listForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  addField,
  updateField,
  removeField,
  reorderFields,
  listPublicForms,
  getPublicForm,
};
