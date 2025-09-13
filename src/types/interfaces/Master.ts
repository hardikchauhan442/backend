import { z } from 'zod';

interface MasterAttributes {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parentCode?: string;
  likeKeyword?: string;
  imageUrl?: string;
  isDefault?: boolean;
  isDisplay?: boolean;
  sequence?: number;
  groupName?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const MasterSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().trim().uuid().optional(),
  parentCode: z.string().trim().optional(),
  likeKeyword: z.array(z.string().trim()).min(1).optional().optional(),
  imageUrl: z.string().trim().url().optional(),
  isDefault: z.boolean().optional(),
  isDisplay: z.boolean().optional(),
  sequence: z.number().int().optional(),
  groupName: z.string().trim().optional(),
  createdBy: z.string().trim().uuid().optional(),
  updatedBy: z.string().trim().uuid().optional(),
  deletedBy: z.string().trim().uuid().optional(),
});

type MasterInput = z.infer<typeof MasterSchema>;

const createMasterSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  likeKeyword: z.array(z.string().trim()).optional(),
  parentId: z.string().trim().uuid().optional(),
  parentCode: z.string().trim().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isDisplay: z.boolean(),
  groupName: z.string().trim().optional(),
  sequence: z.number().optional(),
});

const updateMasterSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  likeKeyword: z.array(z.string().trim()).optional(),
  parentId: z.string().trim().uuid().optional(),
  parentCode: z.string().trim().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isDisplay: z.boolean(),
  groupName: z.string().trim().optional(),
  sequence: z.number().optional(),
});

type CreateMasterSchema = z.infer<typeof createMasterSchema>;
type UpdateMasterSchema = z.infer<typeof updateMasterSchema>;
export { MasterAttributes, MasterInput, CreateMasterSchema, UpdateMasterSchema, createMasterSchema, updateMasterSchema, MasterSchema };
