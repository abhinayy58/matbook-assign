const { sanitizePayload } = require("../utils/sanitizePayload");

function validateRequest(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const data = schema.parse(req[source]);
      sanitizePayload(data);
      req[`validated${source[0].toUpperCase()}${source.slice(1)}`] = data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { validateRequest };

