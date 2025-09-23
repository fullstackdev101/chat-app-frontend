export interface ipRestrictions {
  id: number;
  ip: string;
  notes: string | null;
  office_location: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  created_by: number;
  update_by: number | null;
}
