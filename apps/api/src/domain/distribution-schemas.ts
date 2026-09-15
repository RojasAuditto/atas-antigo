import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a data no formato AAAA-MM-DD").refine(
  (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  "Data invalida",
);

const isoDateTimeSchema = z.string().datetime({ offset: true });
const nonEmptyTextSchema = z.string().trim().min(1);
const moneySchema = z.number().finite().nonnegative();
const percentageSchema = z.number().finite().min(0).max(100);

export const shareholderSchema = z.strictObject({
  name: nonEmptyTextSchema,
  type: z.enum(["PF", "PJ"]),
  taxId: nonEmptyTextSchema.nullable(),
  percentage: percentageSchema,
  entitlement: moneySchema,
});

export const originSchema = z.strictObject({
  id: nonEmptyTextSchema,
  companyTaxId: nonEmptyTextSchema,
  companyName: nonEmptyTextSchema,
  groupName: nonEmptyTextSchema,
  sourceStatus: nonEmptyTextSchema,
  exercise: nonEmptyTextSchema,
  sourceDate: isoDateSchema,
  deadline: isoDateSchema,
  availableAmount: moneySchema,
  allocatedAmount: moneySchema,
  allocationPercent: z.number().finite().nonnegative(),
  shareholders: z.array(shareholderSchema),
});

export const catalogSchema = z.strictObject({
  meta: z.strictObject({
    source: nonEmptyTextSchema,
    generatedAt: isoDateSchema,
    initialDistributed: moneySchema,
    deadlineDefault: isoDateSchema,
    ignoredStatuses: z.array(nonEmptyTextSchema),
    validOrigins: z.number().int().nonnegative(),
    groups: z.number().int().nonnegative(),
    companies: z.number().int().nonnegative(),
    shareholders: z.number().int().nonnegative(),
    availableTotal: moneySchema,
  }),
  origins: z.array(originSchema),
});

export const paymentMethodSchema = z.enum(["TED", "PIX", "Transferência interna", "Outro"]);

const movementBaseSchema = z.strictObject({
  id: nonEmptyTextSchema,
  originId: nonEmptyTextSchema,
  groupName: nonEmptyTextSchema,
  companyTaxId: nonEmptyTextSchema,
  companyName: nonEmptyTextSchema,
  shareholderTaxId: nonEmptyTextSchema.nullable(),
  shareholderName: nonEmptyTextSchema,
  amount: z.number().finite().positive(),
  date: isoDateSchema,
  reference: z.string(),
  proofName: z.string(),
  note: z.string(),
  paymentMethod: paymentMethodSchema,
  createdAt: isoDateTimeSchema,
  createdBy: nonEmptyTextSchema,
});

const effectiveMovementSchema = movementBaseSchema.extend({
  status: z.literal("effective"),
  reversedAt: z.never().optional(),
  reversedBy: z.never().optional(),
});

const reversedMovementSchema = movementBaseSchema.extend({
  status: z.literal("reversed"),
  reversedAt: isoDateTimeSchema,
  reversedBy: nonEmptyTextSchema,
});

export const movementSchema = z.discriminatedUnion("status", [
  effectiveMovementSchema,
  reversedMovementSchema,
]);

export const movementDraftSchema = z.strictObject({
  originId: z.string().trim(),
  shareholderTaxId: z.string().trim().min(1).nullable(),
  shareholderName: z.string().trim(),
  amount: z.number().finite(),
  date: isoDateSchema,
  reference: z.string(),
  proofName: z.string(),
  note: z.string(),
  paymentMethod: paymentMethodSchema,
});

export const movementListSchema = z.array(movementSchema);

export type Catalog = z.infer<typeof catalogSchema>;
export type Movement = z.infer<typeof movementSchema>;
export type MovementDraft = z.infer<typeof movementDraftSchema>;
export type Origin = z.infer<typeof originSchema>;
export type Shareholder = z.infer<typeof shareholderSchema>;
