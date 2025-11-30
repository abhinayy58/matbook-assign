const xss = require("xss");

function sanitizePayload(subject, transformValue) {
  if (!subject || typeof subject !== "object") {
    return subject;
  }

  const applyTransform =
    transformValue ||
    ((value) => {
      if (typeof value === "string") {
        return xss(value);
      }
      return value;
    });

  const cleanKey = (key) => key.replace(/\$/g, "").replace(/\./g, "_");

  Object.keys(subject).forEach((key) => {
    const safeKey = cleanKey(key);

    if (safeKey !== key) {
      subject[safeKey] = subject[key];
      delete subject[key];
    }

    const value = subject[safeKey];

    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (typeof entry === "object") {
          sanitizePayload(entry, applyTransform);
        } else {
          value[index] = applyTransform(entry);
        }
      });
    } else if (value && typeof value === "object") {
      sanitizePayload(value, applyTransform);
    } else {
      subject[safeKey] = applyTransform(value);
    }
  });

  return subject;
}

module.exports = { sanitizePayload };

