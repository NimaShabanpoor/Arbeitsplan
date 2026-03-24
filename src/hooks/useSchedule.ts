import { useState, useCallback, useEffect, useRef } from 'react';
import { Employee, ScheduleMap, WeekTemplate } from '../types';
import { defaultEmployees } from '../data/employees';
import { buildInitialSchedule, makeKey } from '../data/scheduleData';
import { fetchAppData, saveAppData } from '../api/db';

const STORAGE_KEY_SCHEDULE = 'benedict_schedule';
const STORAGE_KEY_EMPLOYEES = 'benedict_employees';
const STORAGE_KEY_TEMPLATES = 'benedict_templates';

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

function getInitialState() {
  const employees = mergeEmployeesWithDefaults(
    loadFromStorage(STORAGE_KEY_EMPLOYEES, defaultEmployees),
    defaultEmployees
  );
  const schedule = loadFromStorage(STORAGE_KEY_SCHEDULE, buildInitialSchedule());
  const templates = loadFromStorage(STORAGE_KEY_TEMPLATES, []);
  return { employees, schedule, templates };
}

export function useSchedule() {
  const [employees, setEmployees] = useState<Employee[]>(() => getInitialState().employees);
  const [schedule, setSchedule] = useState<ScheduleMap>(() => getInitialState().schedule);
  const [templates, setTemplates] = useState<WeekTemplate[]>(() => getInitialState().templates);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchAppData().then(data => {
      if (!mounted.current || !data) return;
      const hasData = data.employees.length > 0 || Object.keys(data.schedule).length > 0;
      if (hasData) {
        setEmployees(mergeEmployeesWithDefaults(data.employees, defaultEmployees));
        setSchedule(data.schedule);
        setTemplates(data.templates);
      }
    });
    return () => { mounted.current = false; };
  }, []);

  const persist = useCallback(async (emp: Employee[], sched: ScheduleMap, tmpl: WeekTemplate[]) => {
    const ok = await saveAppData({ employees: emp, schedule: sched, templates: tmpl });
    if (!ok) {
      saveToStorage(STORAGE_KEY_EMPLOYEES, emp);
      saveToStorage(STORAGE_KEY_SCHEDULE, sched);
      saveToStorage(STORAGE_KEY_TEMPLATES, tmpl);
    }
  }, []);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(employees, schedule, templates);
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [employees, schedule, templates, persist]);

  const setDuty = useCallback((employeeNr: number, date: string, dutyNr: number | null) => {
    setSchedule(prev => {
      const key = makeKey(employeeNr, date);
      const next = { ...prev };
      if (dutyNr === null) delete next[key];
      else next[key] = dutyNr;
      return next;
    });
  }, []);

  const updateEmployee = useCallback((updated: Employee) => {
    setEmployees(prev => prev.map(e => e.nr === updated.nr ? updated : e));
  }, []);

  const addEmployee = useCallback((emp: Employee) => {
    setEmployees(prev => (prev.some(e => e.nr === emp.nr) ? prev : [...prev, emp]));
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
          if (dutyNr === null) delete next[key];
          else next[key] = dutyNr;
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
    persist(defaultEmployees, buildInitialSchedule(), []);
  }, [persist]);

  return {
    employees,
    schedule,
    selectedMonth,
    selectedYear,
    templates,
    setDuty,
    updateEmployee,
    addEmployee,
    removeEmployee,
    navigateMonth,
    goToMonth,
    resetData,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
  };
}
