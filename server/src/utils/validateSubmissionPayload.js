function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toNumber(value, fieldName) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw createError(400, `Field "${fieldName}" expects a numeric value`);
  }
  return num;
}

function buildRegex(pattern, fieldName) {
  try {
    return new RegExp(pattern);
  } catch (error) {
    throw createError(
      500,
      `Invalid regex on field "${fieldName}": ${error.message}`
    );
  }
}

function validatePrimitiveField(field, value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const rules = field.validation || {};
  let sanitizedValue = value;

  switch (field.type) {
    case "text":
    case "textarea":
    case "email": {
      if (typeof value !== "string") {
        throw createError(
          400,
          `Field "${field.name}" expects text input`
        );
      }

      if (field.type === "email") {
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
        if (!emailRegex.test(value)) {
          throw createError(400, `Field "${field.name}" must be a valid email`);
        }
      }

      if (rules.min !== undefined && value.length < rules.min) {
        throw createError(
          400,
          `Field "${field.name}" must have at least ${rules.min} characters`
        );
      }

      if (rules.max !== undefined && value.length > rules.max) {
        throw createError(
          400,
          `Field "${field.name}" must have at most ${rules.max} characters`
        );
      }

      if (rules.regex) {
        const regex = buildRegex(rules.regex, field.name);
        if (!regex.test(value)) {
          throw createError(
            400,
            `Field "${field.name}" does not match the required pattern`
          );
        }
      }
      sanitizedValue = value;
      break;
    }

    case "number": {
      const num = toNumber(value, field.name);

      if (rules.min !== undefined && num < rules.min) {
        throw createError(400, `Field "${field.name}" must be >= ${rules.min}`);
      }

      if (rules.max !== undefined && num > rules.max) {
        throw createError(400, `Field "${field.name}" must be <= ${rules.max}`);
      }

      sanitizedValue = num;
      break;
    }

    case "date": {
      const timestamp = Date.parse(value);
      if (Number.isNaN(timestamp)) {
        throw createError(
          400,
          `Field "${field.name}" must be a valid date`
        );
      }
      sanitizedValue = new Date(timestamp).toISOString();
      break;
    }

    case "checkbox": {
      sanitizedValue = Boolean(value);
      break;
    }

    default:
      sanitizedValue = value;
  }

  return sanitizedValue;
}

function validateSubmissionPayload(formDoc, answers = {}) {
  if (!formDoc || !formDoc.fields) {
    throw createError(500, "Form definition is missing");
  }

  const sanitized = {};

  function handleNested(option, activeAnswers) {
    (option.nestedFields || []).forEach((nestedField) => {
      processField(nestedField, activeAnswers);
    });
  }

  function processField(field, sourceAnswers) {
    const rawValue = sourceAnswers[field.name];
    const hasValue =
      rawValue !== undefined && rawValue !== null && rawValue !== "";

    if (field.required && field.type !== "checkbox" && !hasValue) {
      throw createError(400, `Field "${field.name}" is required`);
    }

    if (!hasValue && field.type !== "checkbox") {
      return;
    }

    if (["select", "radio"].includes(field.type)) {
      if (!field.options || field.options.length === 0) {
        throw createError(500, `Field "${field.name}" is missing options`);
      }

      if (typeof rawValue !== "string") {
        throw createError(400, `Field "${field.name}" expects a single option`);
      }

      const option = field.options.find((opt) => opt.value === rawValue);
      if (!option) {
        throw createError(
          400,
          `Field "${field.name}" received an unknown option`
        );
      }

      sanitized[field.name] = rawValue;
      handleNested(option, sourceAnswers);
      return;
    }

    if (field.type === "checkbox" && field.options?.length) {
      if (!hasValue) {
        if (field.required) {
          throw createError(400, `Field "${field.name}" is required`);
        }
        sanitized[field.name] = [];
        return;
      }

      if (!Array.isArray(rawValue)) {
        throw createError(
          400,
          `Field "${field.name}" expects an array of selections`
        );
      }

      const validValues = new Set(field.options.map((opt) => opt.value));

      rawValue.forEach((value) => {
        if (!validValues.has(value)) {
          throw createError(
            400,
            `Field "${field.name}" received an unknown option`
          );
        }
      });

      sanitized[field.name] = rawValue;

      field.options.forEach((option) => {
        if (rawValue.includes(option.value)) {
          handleNested(option, sourceAnswers);
        }
      });
      return;
    }

    const value = validatePrimitiveField(field, rawValue);

    if (field.type === "checkbox" && !field.options?.length) {
      if (field.required && !value) {
        throw createError(
          400,
          `Field "${field.name}" must be checked`
        );
      }
      sanitized[field.name] = Boolean(value);
      return;
    }

    if (value !== undefined) {
      sanitized[field.name] = value;
    }
  }

  formDoc.fields.forEach((field) => processField(field, answers));

  return sanitized;
}

module.exports = { validateSubmissionPayload };
