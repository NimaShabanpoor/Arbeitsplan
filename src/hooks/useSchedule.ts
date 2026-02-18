import { useState, useCallback, useEffect, useRef } from 'react';
import { Employee, ScheduleMap } from '../types';
import { defaultEmployees } from '../data/employees';
import { buildInitialSchedule, makeKey } from '../data/scheduleData';

const STORAGE_KEY_SCHEDULE = 'benedict_schedule';
const STORAGE_KEY_EMPLOYEES = 'benedict_employees';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useSchedule() {
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage(STORAGE_KEY_EMPLOYEES, defaultEmployees)
  );

  const [schedule, setSchedule] = useState<ScheduleMap>(() =>
    loadFromStorage(STORAGE_KEY_SCHEDULE, buildInitialSchedule())
  );

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth();
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const saveScheduleTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(saveScheduleTimer.current);
    saveScheduleTimer.current = setTimeout(() => {
      saveToStorage(STORAGE_KEY_SCHEDULE, schedule);
    }, 300);
    return () => clearTimeout(saveScheduleTimer.current);
  }, [schedule]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_EMPLOYEES, employees);
  }, [employees]);

  const setDuty = useCallback((employeeNr: number, date: string, dutyNr: number | null) => {
    setSchedule(prev => {
      const key = makeKey(employeeNr, date);
      const next = { ...prev };
      if (dutyNr === null) {
        delete next[key];
      } else {
        next[key] = dutyNr;
      }
      return next;
    });
  }, []);

  const updateEmployee = useCallback((updated: Employee) => {
    setEmployees(prev => prev.map(e => e.nr === updated.nr ? updated : e));
  }, []);

  const addEmployee = useCallback((emp: Employee) => {
    setEmployees(prev => {
      if (prev.some(e => e.nr === emp.nr)) return prev;
      return [...prev, emp];
    });
  }, []);

  const removeEmployee = useCallback((nr: number) => {
    setEmployees(prev => prev.filter(e => e.nr !== nr));
  }, []);

  const navigateMonth = useCallback((direction: number) => {
    setSelectedMonth(prev => {
      const totalMonths = prev + direction;
      if (totalMonths < 0) {
        setSelectedYear(y => y - 1);
        return 11;
      }
      if (totalMonths > 11) {
        setSelectedYear(y => y + 1);
        return 0;
      }
      return totalMonths;
    });
  }, []);

  const goToMonth = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    setSchedule(buildInitialSchedule());
    setEmployees(defaultEmployees);
  }, []);

  return {
    employees,
    schedule,
    selectedMonth,
    selectedYear,
    setDuty,
    updateEmployee,
    addEmployee,
    removeEmployee,
    navigateMonth,
    goToMonth,
    resetData,
  };
}
