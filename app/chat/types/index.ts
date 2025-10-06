// export type UserStatus = "offline" | "online" | "busy" | "away"; // adjust according to your DB enum
// export type AccountStatus = "active" | "inactive" | "blocked"; // adjust according to your DB enum

// export interface User {
//   id: number;
//   name: string;
//   username: string;
//   email: string;
//   password: string;
//   role_id: number;
//   phone_number?: string | null;
//   notes?: string | null;
//   created_by?: number | null;
//   presence: UserStatus;
//   last_seen: string; // ISO date string
//   account_status: AccountStatus;
//   profile_image?: string | null;
//   created_at: string; // ISO date string
//   updated_at: string; // ISO date string
// }

export interface Message {
  id?: number;
  from_user: number;
  to_user?: number;
  group_id?: number;
  text?: string;
  file_url?: string;
  file_name?: string;
  created_at?: string;
}

export interface Group {
  id: number;
  name: string;
  members: number[];
}
