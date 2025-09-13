import z from 'zod';

interface PermissionAttributes {
  id: string;
  description: string;
  permission: object[];
  isActive: boolean;
  role_name: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

const uuid = (z: any) => z.string().uuid();
const description = (z: any) => z.string().optional();
const permission = (z: any) =>
  z.array(
    z.object({
      name: z.string(),
      actions: z.object({
        view: z.boolean().optional(),
        create: z.boolean().optional(),
        edit: z.boolean().optional(),
        delete: z.boolean().optional(),
      }),
    })
  );
const isActive = (z: any) => z.boolean();

export const createPermissionSchema = z.object({
  description: description(z),
  permission: permission(z),
  role_name: z.string().trim().min(1),
  isActive: isActive(z).optional(),
  createdBy: uuid(z).optional(),
});

export const updatePermissionSchema = z.object({
  description: description(z).optional(),
  permission: permission(z).optional(),

  role_name: z.string().trim().optional(),
  isActive: isActive(z).optional(),
  updatedBy: uuid(z).optional(),
});

type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;

export { PermissionAttributes, CreatePermissionDto, UpdatePermissionDto };
