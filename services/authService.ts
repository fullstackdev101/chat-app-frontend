import apiClient from "./apiClient"; // axios instance

// ----------------------------
// LOGIN
// ----------------------------
export const login = async (username: string, password: string) => {
  const response = await apiClient.post("/login", { username, password });

  if (response.data?.token) {
    // Save token for future API calls
    localStorage.setItem("token", response.data.token);
  }

  return response.data; // expected: { token, user }
};

// ----------------------------
// LOGOUT
// ----------------------------
export const logout = async () => {
  // Clear localStorage
  localStorage.removeItem("token");

  // ✅ SECURITY: Call backend to clear the HttpOnly cookie
  // Without this the HttpOnly cookie persists and the user stays authenticated!
  try {
    await apiClient.post("/logout");
  } catch {
    // Silently ignore — even if this fails, localStorage is cleared
  }
};

// ----------------------------
// GET CURRENT USER (from token)
// ----------------------------
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return { token };
};

// ----------------------------
// ADMIN USERS
// ----------------------------
export const getUsers = async () => {
  const response = await apiClient.get("/admin/users");
  return response.data; // backend should return users list
};

export const createUser = async (userData: {
  name: string;
  email: string;
  username: string;
  role_id: number;
  password?: string;
  phone_number?: string;
  notes?: string;
}) => {
  const response = await apiClient.post("/admin/users", userData);
  return response.data; // backend should return new user object
};

export const updateUser = async (
  id: number,
  userData: {
    name?: string;
    email?: string;
    username?: string;
    role_id?: number;
    password?: string;
    phone_number?: string;
    notes?: string;
    account_status?: string;
    presence?: string;
  }
) => {
  const response = await apiClient.put(`/admin/users/${id}`, userData);
  return response.data; // backend should return updated user object
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data; // backend should return success message
};

// ----------------------------
// CHAT USERS (if needed later)
// ----------------------------
export const getChatUsers = async () => {
  const response = await apiClient.get("/chat/users");
  return response.data;
};
