const { Schema, model, Types } = require("mongoose");

const submissionSchema = new Schema(
  {
    formId: { type: Types.ObjectId, ref: "Form", required: true },
    formVersion: { type: Number, required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    schemaSnapshot: { type: Schema.Types.Mixed, required: true },
    meta: {
      ip: String,
      userAgent: String,
      submittedBy: String,
      context: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = model("Submission", submissionSchema);

