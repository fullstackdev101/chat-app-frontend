import apiClient from "./apiClient"; // axios instance

// ----------------------------
// IP addresses
// ----------------------------
export const getIpAddresses = async () => {
  const response = await apiClient.get("/admin/ips");
  return response.data; // expected: { token, user }
};

export const createIp = async (newEntry: {
  office_location: string;
  notes: string;
  status: string; // or "allowed"
}) => {
  const response = await apiClient.post("/admin/ips", newEntry);
  return response.data; // backend should return new user object
};

export const deleteIp = async (id: number) => {
  const response = await apiClient.delete(`/admin/ips/${id}`);
  return response.data;
};

export const updateIp = async (id: number, updatedEntry: {}) => {
  const response = await apiClient.put(`/admin/ips/${id}`, updatedEntry);
  return response.data;
};

// export const getUserIps = async (userId: number) => {
//   const res = await apiClient.get(`/users/${userId}/ips`);
//   return res.data; // should return array of ip_ids
// };

// export const assignUserIps = async (userId: number, ipIds: number[]) => {
//   const res = await apiClient.post(`/users/${userId}/ips`, { ipIds });
//   return res.data;
// };

// services/ipsService.ts
export const getAllowedIpAddresses = async () => {
  const response = await apiClient.get("/admin/allowed-ips");
  return response.data; // expected: { token, user }
};

// Save allowed IPs for a specific user
// POST - Save allowed IPs for a specific user
export const saveUserIpAddresses = async (userId: number, ipIds: number[]) => {
  const response = await apiClient.post("/admin/user-ips", {
    user_id: userId,
    ip_ids: ipIds,
  });
  return response.data;
};
