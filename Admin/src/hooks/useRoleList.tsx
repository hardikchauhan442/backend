import { apiGetRolePermissions } from "@/services/ProjectService";
import { useEffect, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface RoleListData {
  roleOptions: Option[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRoleList = (): RoleListData => {
  const [roleOptions, setRoleOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetRolePermissions<{ data: any[] }>({
        page: 1,
        limit: 1000,
      });

      console.log(response.data.data);

      const roles = (response.data.data || [])
        .filter((role) => role.isActive)
        .map((role) => ({
          label: role.role_name,
          value: role.id,
        }));

      setRoleOptions(roles);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roleOptions,
    loading,
    error,
    refetch: fetchRoles,
  };
};
