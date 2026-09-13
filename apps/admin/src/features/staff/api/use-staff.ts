import { useCallback, useEffect, useState } from "react";

import {
  createStaff,
  fetchStaffById,
  fetchStaffList,
  fetchStaffServiceHistory,
  updateStaff,
} from "../api";
import type {
  Staff,
  StaffHistoryRange,
  StaffServiceHistoryItem,
} from "../types";

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
  }, [loadData]);

  return { staffList, loading, error, refresh: loadData };
}

export function useStaffDetail(id: string) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const staffData = await fetchStaffById(id);
      setStaff(staffData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff details"
      );
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { staff, loading, error, reload, setStaff };
}

export function useStaffServiceHistory(
  staffId: string,
  range: StaffHistoryRange,
  customFrom: string,
  customTo: string
) {
  const [items, setItems] = useState<StaffServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffServiceHistory(staffId, {
        range,
        from: customFrom,
        to: customTo,
      });
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load service history"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [staffId, range, customFrom, customTo]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload };
}

export { createStaff, updateStaff };
