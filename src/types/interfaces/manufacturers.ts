import { z } from 'zod';

const uuid = z.string().uuid();
const uuidOptional = uuid.optional();

const nonEmptyText = z.string().trim().min(1, 'Required');
const textOptional = z.string().trim().optional();
const numberOptional = z.number().optional();

const emailOptional = z.string().email().optional();
const websiteOptional = z.string().optional();

const timestamp = z.coerce.date();

export const ManufacturerCreateSchema = z.object({
  manufacturerName: nonEmptyText,
  manufacturerCode: nonEmptyText,

  contactPerson: textOptional,
  contactNumber: textOptional,
  email: emailOptional,
  website: websiteOptional,

  addressLine1: textOptional,
  addressLine2: textOptional,
  cityId: numberOptional,
  stateId: numberOptional,
  countryId: numberOptional,
  zipCode: textOptional,

  notes: textOptional,
  isActive: z.coerce.boolean().default(true),

  createdBy: uuidOptional,
});

/**
 * UPDATE (PATCH) schema
 */
export const ManufacturerUpdateSchema = z
  .object({
    manufacturerName: nonEmptyText.optional(),
    manufacturerCode: nonEmptyText.optional(),

    contactPerson: textOptional,
    contactNumber: textOptional,
    email: emailOptional,
    website: websiteOptional,

    addressLine1: textOptional,
    addressLine2: textOptional,
    cityId: numberOptional,
    stateId: numberOptional,
    countryId: numberOptional,
    zipCode: textOptional,

    notes: textOptional,
    isActive: z.coerce.boolean().optional(),

    updatedBy: uuidOptional,
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided to update.' });

export const ManufacturerIdParamSchema = z.object({
  id: uuid,
});

export type ManufacturerCreate = z.infer<typeof ManufacturerCreateSchema>;
export type ManufacturerUpdate = z.infer<typeof ManufacturerUpdateSchema>;
