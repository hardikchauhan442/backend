// src/validation/productionTracker.schema.ts
import { z } from 'zod';

export const productionTrackerCreateSchema = z.object({
  job_id: z.string().min(1, 'Job ID is required'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold', 'Qc', 'Cancelled']).default('Pending'),
  description: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

export const productionTrackerUpdateSchema = z.object({
  job_id: z.string().min(1, 'Job ID is required'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold', 'Qc', 'Cancelled']).default('Pending'),
  description: z.string().optional(),
  updated_by: z.string().uuid().optional(),
  return_materials: z
    .array(
      z.object({
        material_type_id: z.string().uuid().min(1, 'Material Type ID is required'),
        material_name_id: z.string().uuid().min(1, 'Material Name ID is required'),
        quantity: z.number().min(1, 'Quantity is required'),
        weight: z.number().min(1, 'Weight is required'),
        notes: z.string().optional(),
        created_by: z.string().uuid().optional(),
      })
    )
    .optional(),
  wastage_materials: z
    .array(
      z.object({
        material_type_id: z.string().uuid().min(1, 'Material Type ID is required'),
        material_name_id: z.string().uuid().min(1, 'Material Name ID is required'),
        quantity: z.number().min(1, 'Quantity is required'),
        weight: z.number().min(1, 'Weight is required'),
        notes: z.string().optional(),
        created_by: z.string().uuid().optional(),
      })
    )
    .optional(),
});

export type ProductionTrackerCreate = z.infer<typeof productionTrackerCreateSchema>;
export type ProductionTrackerUpdate = z.infer<typeof productionTrackerUpdateSchema>;
