import apiClient from "./apiClient";
import { FEATURES } from "@/lib/featureFlags";

/* ══════════════════════════════════════════════════════════════
 * DUAL ENDPOINT SUPPORT - FEATURE FLAG CONTROLLED
 * ══════════════════════════════════════════════════════════════ */

export const getConversations = async (
  page?: number,
  limit?: number,
  type?: "direct" | "group" | "all"
) => {
  if (FEATURES.PAGINATION_ENABLED) {
    // ✅ NEW: Use paginated endpoint
    const params = new URLSearchParams({
      page: (page || 1).toString(),
      limit: (limit || 20).toString(),
      ...(type && { type }),
    });

    const response = await apiClient.get(`/admin/conversations?${params}`);
    return response.data;
  } else {
    // ✅ OLD: Use original endpoint (rollback path)
    const response = await apiClient.get("/admin/getConversationsData");
    return {
      conversations: response.data,
      pagination: null, // No pagination in old version
    };
  }
};

export const getConversationMessages = async (
  type: "direct" | "group",
  id: string,
  page?: number,
  limit?: number
) => {
  if (FEATURES.PAGINATION_ENABLED) {
    // ✅ NEW: Paginated messages
    const params = new URLSearchParams({
      type,
      id,
      page: (page || 1).toString(),
      limit: (limit || 50).toString(),
    });

    const response = await apiClient.get(
      `/admin/conversation-messages?${params}`
    );
    return response.data;
  } else {
    // ✅ OLD: Extract messages from full conversation data
    const allData = await apiClient.get("/admin/getConversationsData");
    const conversation = allData.data.find((c: any) => {
      if (type === "direct") {
        return c.id === parseInt(id, 10) || c.id === `direct-${id}`;
      } else {
        return c.id === parseInt(id, 10) || c.id === `group-${id}`;
      }
    });

    return {
      messages: conversation?.messages || [],
      pagination: null,
    };
  }
};

/* ══════════════════════════════════════════════════════════════
 * DELETE OPERATIONS
 * ══════════════════════════════════════════════════════════════ */

export const deleteMessage = async (messageId: number) => {
  const response = await apiClient.delete(`/admin/message/${messageId}`);
  return response.data;
};

export const deleteDirectConversation = async (fromUser: number, toUser: number) => {
  const params = new URLSearchParams({
    fromUser: fromUser.toString(),
    toUser: toUser.toString(),
  });
  const response = await apiClient.delete(`/admin/conversation/direct?${params}`);
  return response.data;
};

export const deleteGroup = async (groupId: number) => {
  const response = await apiClient.delete(`/admin/group/${groupId}`);
  return response.data;
};
