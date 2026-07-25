import { useState, useEffect } from "react";
import { Staff, AttendanceRecord } from "../types";
import { fetchStaffList, fetchStaffById, fetchAttendance, createStaff, addAttendance } from "../api";

export function useStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffList().then((data) => {
      setStaffList(data);
      setLoading(false);
    });
  }, []);

  return { staffList, loading };
}

export function useStaffDetail(id: string, month?: string) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStaffById(id),
      fetchAttendance(id, month)
    ]).then(([staffData, attendanceData]) => {
      setStaff(staffData);
      setAttendance(attendanceData);
      setLoading(false);
    });
  }, [id, month]);

  return { staff, attendance, loading, setAttendance };
}

export { createStaff, addAttendance };
