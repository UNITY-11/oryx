export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  baseSalary: number; // Monthly salary
  status: "Active" | "Inactive";
  imageUrl?: string;
  joinedDate: string;
  todayAttendance?: AttendanceRecord;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // ISO string
  checkOut?: string; // ISO string
  totalHours?: number;
  status: "Present" | "Absent" | "Half Day" | "Late";
  reason?: string; // Only fetched if explicitly requested or provided when marking absent
}

