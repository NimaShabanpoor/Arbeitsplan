import { useState, useCallback, useEffect, useRef } from 'react';
import { Employee, ScheduleMap, WeekTemplate, DutyNoteMap } from '../types';
import { defaultEmployees } from '../data/employees';
import { buildInitialSchedule, makeKey } from '../data/scheduleData';
import { ImportedEmployeePlan } from '../utils/planImport';

const STORAGE_KEY_SCHEDULE = 'benedict_schedule';
const STORAGE_KEY_EMPLOYEES = 'benedict_employees';
const STORAGE_KEY_TEMPLATES = 'benedict_templates';
const STORAGE_KEY_DUTY_NOTES = 'benedict_duty_notes';

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

function mergeEmployeesWithDefaults(stored: Employee[], defaults: Employee[]): Employee[] {
  const byNr = new Map(defaults.map(emp => [emp.nr, emp]));
  return stored.map(emp => {
    const fallback = byNr.get(emp.nr);
    if (!fallback) return emp;
    return {
      ...fallback,
      ...emp,
      dienstStatistik: {
        ...(fallback.dienstStatistik || {}),
        ...(emp.dienstStatistik || {}),
      },
    };
  });
}

export function useSchedule() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const loaded = loadFromStorage(STORAGE_KEY_EMPLOYEES, defaultEmployees);
    return mergeEmployeesWithDefaults(loaded, defaultEmployees);
  });

  const [schedule, setSchedule] = useState<ScheduleMap>(() =>
    loadFromStorage(STORAGE_KEY_SCHEDULE, buildInitialSchedule())
  );
  const [dutyNotes, setDutyNotes] = useState<DutyNoteMap>(() =>
    loadFromStorage(STORAGE_KEY_DUTY_NOTES, {})
  );

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth();
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const saveScheduleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
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

  useEffect(() => {
    saveToStorage(STORAGE_KEY_DUTY_NOTES, dutyNotes);
  }, [dutyNotes]);

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
    if (dutyNr === null) {
      setDutyNotes(prev => {
        const key = makeKey(employeeNr, date);
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  const setDutyNote = useCallback((employeeNr: number, date: string, note: string) => {
    const key = makeKey(employeeNr, date);
    setDutyNotes(prev => {
      const next = { ...prev };
      const cleaned = note.trim();
      if (!cleaned) {
        delete next[key];
      } else {
        next[key] = cleaned;
      }
      return next;
    });
  }, []);

  const importPlans = useCallback((plans: ImportedEmployeePlan[], startDate: string) => {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return;
    const yearEnd = new Date(start.getFullYear(), 11, 31);

    setSchedule(prev => {
      const next = { ...prev };

      // Bereich für betroffene Mitarbeitende zuerst leeren
      for (const plan of plans) {
        for (let d = new Date(start); d <= yearEnd; d.setDate(d.getDate() + 1)) {
          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          delete next[makeKey(plan.employeeNr, dateKey)];
        }
      }

      // Importierte Werte setzen
      for (const plan of plans) {
        for (let i = 0; i < plan.values.length; i += 1) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          if (d > yearEnd) break;

          const dutyNr = plan.values[i];
          if (dutyNr === null) continue;

          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          next[makeKey(plan.employeeNr, dateKey)] = dutyNr;
        }
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

  const [templates, setTemplates] = useState<WeekTemplate[]>(() =>
    loadFromStorage(STORAGE_KEY_TEMPLATES, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY_TEMPLATES, templates);
  }, [templates]);

  const saveTemplate = useCallback((tpl: WeekTemplate) => {
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === tpl.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = tpl;
        return next;
      }
      return [...prev, tpl];
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const applyTemplate = useCallback((
    tpl: WeekTemplate,
    employeeNrs: number[],
    startDate: string,
    endDate: string,
  ) => {
    setSchedule(prev => {
      const next = { ...prev };
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        let dow = d.getDay();
        dow = dow === 0 ? 6 : dow - 1;

        const dutyNr = tpl.days[dow];
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        for (const empNr of employeeNrs) {
          const key = makeKey(empNr, dateKey);
          if (dutyNr === null) {
            delete next[key];
          } else {
            next[key] = dutyNr;
          }
        }
      }
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem(STORAGE_KEY_TEMPLATES);
    setSchedule(buildInitialSchedule());
    setEmployees(defaultEmployees);
    setTemplates([]);
  }, []);

  return {
    employees,
    schedule,
    dutyNotes,
    selectedMonth,
    selectedYear,
    templates,
    setDuty,
    setDutyNote,
    updateEmployee,
    addEmployee,
    removeEmployee,
    navigateMonth,
    goToMonth,
    resetData,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
    importPlans,
  };
}
