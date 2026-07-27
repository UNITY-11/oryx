import { useCallback, useEffect, useState } from "react";

import {
  addAttendance,
  createStaff,
  fetchAttendance,
  fetchStaffById,
  fetchStaffList,
  updateStaff,
} from "../api";
import { AttendanceRecord, Staff } from "../types";

export function useStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffList();
      setStaffList(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff list"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    window.addEventListener("focus", loadData);
    window.addEventListener("popstate", loadData);

    return () => {
      window.removeEventListener("focus", loadData);
      window.removeEventListener("popstate", loadData);
    };
  }, [loadData]);

  return { staffList, loading, error, refresh: loadData };
}

export function useStaffDetail(id: string, month?: string) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, attendanceData] = await Promise.all([
        fetchStaffById(id),
        fetchAttendance(id, month),
      ]);
      setStaff(staffData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff details"
      );
      setStaff(null);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [id, month]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    staff,
    attendance,
    loading,
    error,
    reload,
    setAttendance,
    setStaff,
  };
}

export { createStaff, addAttendance, updateStaff };
