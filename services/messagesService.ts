import apiClient from "./apiClient"; // axios instance

export const getConversations = async () => {
  const response = await apiClient.get("/admin/getConversationsData");
  return response.data; // backend should return users list
};
