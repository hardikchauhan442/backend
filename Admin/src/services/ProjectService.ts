import { encrypt } from "@/utils/enc-dec";
import ApiService from "./ApiService";

export async function apiAdminLogin<T, U extends Record<string, unknown>>(
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/auth/login`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiCreateMaster<T, U extends Record<string, unknown>>(
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/master`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetMasters<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/master`,
    method: "get",
    params,
  });
}

export async function apiUpdateMaster<T, U extends Record<string, unknown>>(
  id: string | number,
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/master/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteMaster<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/master/${id}`,
    method: "delete",
  });
}

export async function apiUpdateSequenceMaster<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: `/master/sequence`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiCreateUser<T, U extends Record<string, unknown>>(
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/user`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetUsers<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/user`,
    method: "get",
    params,
  });
}

export async function apiUpdateUser<T, U extends Record<string, unknown>>(
  id: string | number,
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/user/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteUser<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/user/${id}`,
    method: "delete",
  });
}

export async function apiCreateRolePermission<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: `/permission`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetRolePermissions<T>(
  params?: Record<string, unknown>
) {
  return ApiService.fetchData<T>({
    url: `/permission`,
    method: "get",
    params,
  });
}

export async function apiUpdateRolePermission<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/permission/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteRolePermission<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/permission/${id}`,
    method: "delete",
  });
}

export async function apiCreateRawMaterial<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: `/raw-material`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetRawMaterials<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/raw-material`,
    method: "get",
    params,
  });
}

export async function apiUpdateRawMaterial<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/raw-material/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteRawMaterial<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/raw-material/${id}`,
    method: "delete",
  });
}

export async function apiCreateVendor<T, U extends Record<string, unknown>>(
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/vendor`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetVendors<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/vendor`,
    method: "get",
    params,
  });
}

export async function apiUpdateVendor<T, U extends Record<string, unknown>>(
  id: string | number,
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/vendor/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteVendor<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/vendor/${id}`,
    method: "delete",
  });
}

export async function apiCreateManufacturer<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: `/manufacturer`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetManufacturers<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/manufacturer`,
    method: "get",
    params,
  });
}

export async function apiUpdateManufacturer<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/manufacturer/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteManufacturer<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/manufacturer/${id}`,
    method: "delete",
  });
}

// Country, State, City APIs
export const apiGetCountries = () => {
  return ApiService.fetchData({
    url: "/country",
    method: "get",
  });
};

export const apiGetStates = (countryId: string) => {
  return ApiService.fetchData({
    url: `/state/${countryId}`,
    method: "get",
  });
};

export const apiGetCities = (stateId: string) => {
  return ApiService.fetchData({
    url: `/city/state/${stateId}`,
    method: "get",
  });
};

export async function apiGetStock<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/stock`,
    method: "get",
    params,
  });
}

export async function apiGetTransections<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/transaction`,
    method: "get",
    params,
  });
}

export async function apiCreateJob<T, U extends Record<string, unknown>>(
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/jobs`,
    method: "post",
    data: encrypt(data),
  });
}

export async function apiGetJobs<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: `/jobs`,
    method: "get",
    params,
  });
}

export async function apiUpdateJob<T, U extends Record<string, unknown>>(
  id: string | number,
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/jobs/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiDeleteJob<T>(id: string | number) {
  return ApiService.fetchData<T>({
    url: `/jobs/${id}`,
    method: "delete",
  });
}

export async function apiUpdateJobStatus<T, U extends Record<string, unknown>>(
  id: string | number,
  data: U
) {
  return ApiService.fetchData<T>({
    url: `/jobs/status/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiGetProductionTrackers<T>(
  params?: Record<string, unknown>
) {
  return ApiService.fetchData<T>({
    url: `/production-tracker`,
    method: "get",
    params,
  });
}

export async function apiUpdateProductionJobStatus<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/production-tracker/status/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiGetProductionCounts<T>(
  params?: Record<string, unknown>
) {
  return ApiService.fetchData<T>({
    url: "/production-tracker/count",
    method: "get",
    params,
  });
}

export async function apiGetWastageRecords<T>(
  params?: Record<string, unknown>
) {
  return ApiService.fetchData<T>({
    url: "/jobs/wastage-material",
    method: "get",
    params,
  });
}

export async function apiCreateWastageRecord<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: "/jobs/wastage-material",
    method: "post",
    data: encrypt(data),
  });
}

export async function apiUpdateWastageRecord<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/jobs/wastage-material/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiUpdateWastageStatus<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/jobs/wastage-material/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiGetReturnRecords<T>(params?: Record<string, unknown>) {
  return ApiService.fetchData<T>({
    url: "/jobs/return-material",
    method: "get",
    params,
  });
}

export async function apiCreateReturnRecord<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: "/jobs/return-material",
    method: "post",
    data: encrypt(data),
  });
}

export async function apiUpdateReturnRecord<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/jobs/return-material/${id}`,
    method: "put",
    data: encrypt(data),
  });
}

export async function apiUpdateReturnStatus<
  T,
  U extends Record<string, unknown>
>(id: string | number, data: U) {
  return ApiService.fetchData<T>({
    url: `/jobs/return-material/${id}`,
    method: "put",
    data: encrypt(data),
  });
}
