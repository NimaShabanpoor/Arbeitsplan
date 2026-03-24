import type { Employee, ScheduleMap, WeekTemplate } from '../types';

const API_BASE = '';

export interface AppData {
  employees: Employee[];
  schedule: ScheduleMap;
  templates: WeekTemplate[];
}

export async function fetchAppData(): Promise<AppData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      employees: Array.isArray(data.employees) ? data.employees : [],
      schedule: data.schedule && typeof data.schedule === 'object' ? data.schedule : {},
      templates: Array.isArray(data.templates) ? data.templates : [],
    };
  } catch {
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employees: data.employees,
        schedule: data.schedule,
        templates: data.templates,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
