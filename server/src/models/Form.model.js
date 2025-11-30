const { Schema, model } = require("mongoose");

const formSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fields: { type: [Schema.Types.Mixed], default: [] },
    version: { type: Number, default: 1 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Form", formSchema);

