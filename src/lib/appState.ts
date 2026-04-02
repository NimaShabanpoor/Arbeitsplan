import type { Employee, ScheduleMap, WeekTemplate } from '../types';
import { supabase } from './supabase';

export interface AppStateData {
  employees: Employee[];
  schedule: ScheduleMap;
  templates: WeekTemplate[];
}

export async function loadAppState(): Promise<AppStateData | null> {
  const { data, error } = await supabase
    .from('Arbeitsplan')
    .select('employees, schedule, templates')
    .eq('id', 'default')
    .single();

  if (error) return null;

  return {
    employees: Array.isArray(data?.employees) ? data.employees : [],
    schedule: data?.schedule && typeof data.schedule === 'object' && !Array.isArray(data.schedule) ? data.schedule : {},
    templates: Array.isArray(data?.templates) ? data.templates : [],
  };
}

export async function saveAppState(data: AppStateData): Promise<boolean> {
  const { error } = await supabase
    .from('Arbeitsplan')
    .upsert(
      {
        id: 'default',
        employees: data.employees,
        schedule: data.schedule,
        templates: data.templates,
      },
      { onConflict: 'id' }
    );

  return !error;
}
