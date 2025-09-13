// validation/jobs.ts
import { z } from 'zod';

export const materialSchema = z.object({
  id: z.string().uuid().optional(),
  material_type_id: z.string().uuid().nullable().optional(),
  material_name_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().nonnegative().optional().default(0),
  weight: z.number().nonnegative().optional().default(0),
  unit_id: z.string().uuid().nullable().optional(),
  material_cost: z.number().nonnegative().optional().default(0),
});

export const createJobSchema = z.object({
  product_name: z.string().min(1),
  customer_name: z.string().min(1),
  priority: z.enum(['Low', 'Medium', 'High']),
  due_date: z.string().datetime().or(z.string().date()).optional(), // can handle ISO string
  cost_estimate: z.number().nonnegative().optional(),
  manufacturer_id: z.string().uuid().nullable().optional(),
  job_description: z.string().optional(),
  special_instructions: z.string().optional(),
  file_path: z.string().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold']).optional(),
  created_by: z.string().uuid().optional(),
  materials: z.array(materialSchema).min(1),
});

export const updateJobSchema = z.object({
  // job id to update
  product_name: z.string().min(1).optional(),
  customer_name: z.string().min(1).optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  due_date: z.string().datetime().or(z.string().date()).optional(),
  job_description: z.string().optional(),
  cost_estimate: z.number().nonnegative().optional(),
  manufacturer_id: z.string().uuid().nullable().optional(),
  special_instructions: z.string().optional(),
  file_path: z.string().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold']).optional(),
  updated_by: z.string().uuid().optional(),
  materials: z.array(materialSchema).min(1),
});

export type JobsCreateSchema = z.infer<typeof createJobSchema>;
export type JobsUpdateSchema = z.infer<typeof updateJobSchema>;

// common schema for both tables
export const materialRecordSchema = z.object({
  id: z.string().uuid().optional(), // DB will generate, so optional on create
  job_id: z.string().uuid(),
  material_type_id: z.string().uuid().nullable(),
  material_name_id: z.string().uuid().nullable(),
  quantity: z.number().int().nonnegative().default(0),
  weight: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
  deleted_by: z.string().uuid().nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  deleted_at: z.date().nullable().optional(),
});

export const materialRecordUpdateSchema = z.object({
  job_id: z.string().uuid().optional(),
  material_type_id: z.string().uuid().nullable().optional(),
  material_name_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  updated_by: z.string().uuid().nullable().optional(),
  updated_at: z.date().optional(),
});

export type MaterialRecordUpdateSchema = z.infer<typeof materialRecordUpdateSchema>;
export type MaterialRecordSchema = z.infer<typeof materialRecordSchema>;
