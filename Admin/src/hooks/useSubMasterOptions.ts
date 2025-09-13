import { useAppSelector } from "@/store/hooks"; // adjust import path
import { useMemo } from "react";

interface Option {
  label: string;
  value: string;
}

export function useSubMasterOptions(code: string): Option[] {
  const masters = useAppSelector((state) => state.user.masters);

  return useMemo(() => {
    if (!masters || masters.length === 0) return [];

    // Find master by code
    const master = masters?.find((m) => m.code === code);

    if (!master || !master?.subMasters) return [];

    // Map subMasters to {label, value}
    return master?.subMasters?.map((sub) => ({
      label: sub?.name,
      value: sub?.id,
    }));
  }, [masters, code]);
}
