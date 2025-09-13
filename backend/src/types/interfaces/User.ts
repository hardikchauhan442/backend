import { z } from 'zod';

interface UserAttributes {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  isActive: boolean;
  roleId: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const uuid = z.string().uuid();
const email = z.string().email();
const phone = z.string().min(10).max(15).optional();
const password = z.string().min(6);
const name = z.string().min(1);

const createUserSchema = z.object({
  name,
  email,
  phone,
  password,
  roleId: uuid,
  isActive: z.boolean().optional(),
  createdBy: uuid.optional(),
});

// Update user schema
const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  phone,
  roleId: uuid,
  isActive: z.boolean().optional(),
  updatedBy: uuid.optional(),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export { UserAttributes, loginSchema, createUserSchema, updateUserSchema };
