import { apiGetManufacturers, apiGetVendors } from "@/services/ProjectService";
import { useEffect, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface VendorsManufacturersData {
  vendorOptions: Option[];
  manufacturerOptions: Option[];
  allOptions: Option[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useVendorsManufacturers = (): VendorsManufacturersData => {
  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [vendorsRes, manufacturersRes] = await Promise.all([
        apiGetVendors<{ data: any[] }>({ page: 1, limit: 1000 }),
        apiGetManufacturers<{ data: any[] }>({ page: 1, limit: 1000 }),
      ]);

      const vendors = (vendorsRes.data.data || [])
        ?.filter((vendor) => vendor?.isActive)
        ?.map((vendor) => ({
          label: vendor.vendorName,
          value: vendor.id,
        }));

      const manufacturers = (manufacturersRes.data.data || [])
        ?.filter((manufacturer) => manufacturer.isActive)
        ?.map((manufacturer) => ({
          label: manufacturer.manufacturerName,
          value: manufacturer.id,
        }));

      setVendorOptions(vendors);
      setManufacturerOptions(manufacturers);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to fetch vendors and manufacturers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allOptions = [...vendorOptions, ...manufacturerOptions];

  return {
    vendorOptions,
    manufacturerOptions,
    allOptions,
    loading,
    error,
    refetch: fetchData,
  };
};
