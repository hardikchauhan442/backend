import { z } from 'zod';

const uuid = z.string().uuid();
const uuidOptional = uuid.optional();

const emailOptional = z.string().email().optional();
const websiteOptional = z.string().optional();
const numberOptional = z.number().optional();

const nonEmptyText = z.string().trim().min(1, 'Required');
const textOptional = z.string().trim().optional();

export const VendorCreateSchema = z.object({
  vendorName: nonEmptyText,
  vendorCode: nonEmptyText,

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
 * UPDATE (PATCH) schema — all fields optional.
 */
export const VendorUpdateSchema = z
  .object({
    vendorName: nonEmptyText.optional(),
    vendorCode: nonEmptyText.optional(),

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

export type VendorCreate = z.infer<typeof VendorCreateSchema>;
export type VendorUpdate = z.infer<typeof VendorUpdateSchema>;
