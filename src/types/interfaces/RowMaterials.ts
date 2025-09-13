import z from 'zod';

const uuid = z.string().uuid();
const uuidOptional = uuid.optional();
const nonEmptyText = z.string().trim().min(1, 'Required');
const textOptional = z.string().trim().optional();
const intNonNeg = z.coerce.number().int().nonnegative();
const numericNonNeg = z.coerce.number().nonnegative();

export const RawMaterialCreateSchema = z.object({
  material_name_id: uuid,
  material_type_id: uuid,
  unit_id: uuid,
  vendor_id: nonEmptyText,
  quantity: intNonNeg.default(0),
  weight: numericNonNeg.default(0),
  status: z.coerce.number().optional(),
  description: textOptional,
  is_active: z.coerce.boolean().default(true),
  created_by: uuidOptional,
  updated_by: uuidOptional,
  deleted_by: uuidOptional,
});

export const RawMaterialUpdateSchema = z.object({
  material_name_id: uuid,
  material_type_id: uuid,
  unit_id: uuid,
  vendor_id: uuid,
  quantity: intNonNeg.default(0),
  weight: numericNonNeg.default(0),

  status: z.coerce.number().optional(),

  description: textOptional,

  is_active: z.coerce.boolean().default(true),

  created_by: uuidOptional,
  updated_by: uuidOptional,
  deleted_by: uuidOptional,
});

type CreateRawMaterialDto = z.infer<typeof RawMaterialCreateSchema>;
type UpdateRawMaterialDto = z.infer<typeof RawMaterialUpdateSchema>;

export { CreateRawMaterialDto, UpdateRawMaterialDto };
