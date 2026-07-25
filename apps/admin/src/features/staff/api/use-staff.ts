import { useState, useEffect } from "react";
import { Staff, AttendanceRecord } from "../types";
import { fetchStaffList, fetchStaffById, fetchAttendance, createStaff, addAttendance, updateStaff } from "../api";

export function useStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetchStaffList().then((data) => {
      setStaffList(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    window.addEventListener("focus", loadData);
    window.addEventListener("popstate", loadData);
    
    return () => {
      window.removeEventListener("focus", loadData);
      window.removeEventListener("popstate", loadData);
    };
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

  return { staff, attendance, loading, setAttendance, setStaff };
}

export { createStaff, addAttendance, updateStaff };
