import apiClient from "./apiClient"; // axios instance

// ----------------------------
// PRELOAD
// ----------------------------
export const getPreloads = async (selectedIp: string) => {
  const response = await apiClient.get(`chat/preload?selectedIp=${selectedIp}`);
  return response;
};

export const getContacts = async (selectedIp: string) => {
  const response = await apiClient.get(
    `chat/contacts?selectedIp=${selectedIp}`
  );
  return response;
};
