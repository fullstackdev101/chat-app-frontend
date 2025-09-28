import apiClient from "./apiClient"; // axios instance

// ----------------------------
// PRELOAD
// ----------------------------
export const getPreloads = async () => {
  const response = await apiClient.get("chat/preload");
  return response;
};

export const getContacts = async () => {
  const response = await apiClient.get("chat/contacts");
  return response;
};
