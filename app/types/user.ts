// types/user.ts

export interface User {
  id: number;
  name: string; // required
  username: string;
  email: string;
  password: string;
  role_id: number;
  phone_number: string | null;
  notes: string | null;
  created_by: number | null;
  presence: "online" | "offline" | "away" | "busy";
  account_status: "active" | "inactive" | "blocked"; // 🔧 add blocked
  last_seen: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  role_name?: string;
  office_location?: string | null;
  ip_address?: string | null;
  ip_id?: number | null;
  user_ip?: string; // IP address user is logged in from
}

// Default user object
export const defaultUser: User = {
  id: 0,
  name: "",
  username: "",
  email: "",
  password: "",
  role_id: 1,
  phone_number: null,
  notes: null,
  created_by: null,
  presence: "offline",
  account_status: "active",
  last_seen: new Date().toISOString(),
  profile_image: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
