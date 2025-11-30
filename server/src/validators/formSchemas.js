const { z } = require("zod");

const fieldTypes = [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "checkbox",
  "radio",
  "select",
];

const validationSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    regex: z.string().optional(),
  })
  .partial();

const fieldSchema = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    label: z.string().min(1),
    name: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "name can only include letters, numbers, and underscores",
      }),
    type: z.enum(fieldTypes),
    description: z.string().optional(),
    required: z.boolean().default(false),
    order: z.number().int().nonnegative().default(0),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          nestedFields: z.array(fieldSchema).default([]),
        })
      )
      .default([]),
    validation: validationSchema.optional(),
  })
);

const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  fields: z.array(fieldSchema).default([]),
});

const updateFormSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    fields: z.array(fieldSchema).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one property to update"
  );

const reorderFieldsSchema = z.object({
  order: z.array(z.string()).min(1),
});

module.exports = {
  fieldSchema,
  createFormSchema,
  updateFormSchema,
  reorderFieldsSchema,
};

