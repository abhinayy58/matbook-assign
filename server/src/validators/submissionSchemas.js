const { z } = require("zod");

const submissionSchema = z.object({
  answers: z.record(z.string(), z.any()),
  metadata: z
    .object({
      submittedBy: z.string().optional(),
      context: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

const submissionsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional(),
  formId: z.string().optional(),
});

module.exports = { submissionSchema, submissionsQuerySchema };

