import apiClient from "./apiClient"; // axios instance

// ----------------------------
// IP addresses
// ----------------------------
export const getDashboardStats = async () => {
  const response = await apiClient.get("/admin/dashboard-stats");
  return response.data; // expected: { token, user }
};
