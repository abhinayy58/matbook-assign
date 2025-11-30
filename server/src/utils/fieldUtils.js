function walkFields(fields = [], iterator, trail = []) {
  fields.forEach((field, index) => {
    iterator(field, trail, index);

    (field.options || []).forEach((option) => {
      if (option.nestedFields && option.nestedFields.length > 0) {
        walkFields(option.nestedFields, iterator, [
          ...trail,
          { parent: field.name, option: option.value },
        ]);
      }
    });
  });
}

function createError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function assertUniqueNames(fields = []) {
  const names = new Set();
  walkFields(fields, (field) => {
    if (names.has(field.name)) {
      throw createError(`Duplicate field name detected: ${field.name}`, 400);
    }
    names.add(field.name);
  });
}

function ensureOptionRules(field) {
  if (["select", "radio"].includes(field.type)) {
    if (!field.options || field.options.length === 0) {
      throw createError(
        `Field "${field.name}" requires at least one option`,
        400
      );
    }
  }
}

function normalizeField(field, index) {
  const trimmedLabel = typeof field.label === "string" ? field.label.trim() : "";
  const trimmedName = typeof field.name === "string" ? field.name.trim() : "";

  return {
    ...field,
    label: trimmedLabel,
    name: trimmedName,
    required: Boolean(field.required),
    order:
      typeof field.order === "number" && field.order >= 0 ? field.order : index,
    options: (field.options || []).map((option) => ({
      ...option,
      label: typeof option.label === "string" ? option.label.trim() : "",
      value: typeof option.value === "string" ? option.value.trim() : "",
      nestedFields: (option.nestedFields || []).map((nested, nestedIndex) =>
        normalizeField(nested, nestedIndex)
      ),
    })),
  };
}

function normalizeFields(fields = []) {
  return fields.map((field, index) => {
    const normalized = normalizeField(field, index);
    ensureOptionRules(normalized);

    normalized.options = normalized.options.map((option) => {
      if (option.nestedFields?.length) {
        option.nestedFields = normalizeFields(option.nestedFields);
      }
      return option;
    });

    return normalized;
  });
}

function sortFieldsInPlace(fields = []) {
  fields.sort((a, b) => a.order - b.order);

  fields.forEach((field) => {
    (field.options || []).forEach((option) => {
      if (option.nestedFields?.length) {
        sortFieldsInPlace(option.nestedFields);
      }
    });
  });
}

function findFieldByName(fields = [], name) {
  for (const field of fields) {
    if (field.name === name) {
      return { field, parentArray: fields };
    }

    for (const option of field.options || []) {
      if (option.nestedFields?.length) {
        const result = findFieldByName(option.nestedFields, name);
        if (result) return result;
      }
    }
  }
  return null;
}

function removeFieldByName(fields = [], name) {
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].name === name) {
      fields.splice(i, 1);
      return true;
    }

    for (const option of fields[i].options || []) {
      if (option.nestedFields?.length) {
        const deleted = removeFieldByName(option.nestedFields, name);
        if (deleted) return true;
      }
    }
  }
  return false;
}

function applyReorder(fields = [], orderedNames = []) {
  const orderMap = new Map();
  orderedNames.forEach((name, index) => orderMap.set(name, index));

  walkFields(fields, (field) => {
    if (orderMap.has(field.name)) {
      field.order = orderMap.get(field.name);
    }
  });

  sortFieldsInPlace(fields);
}

module.exports = {
  walkFields,
  assertUniqueNames,
  normalizeFields,
  sortFieldsInPlace,
  findFieldByName,
  removeFieldByName,
  applyReorder,
};
