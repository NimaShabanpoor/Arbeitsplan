export interface Employee {
  nr: number;
  name: string;
  vorname: string;
  funktion: string;
  standort: string;
  aktiv: boolean;
  anrede?: string;
  email?: string;
  telefon?: string;
  geburtstag?: string;
  ferienguthaben?: number;
  restferien?: number;
}

export interface DutyType {
  nr: number;
  name: string;
  shortName: string;
  startTime: string;
  endTime: string;
  color: string;
  textColor: string;
}

export type ScheduleMap = Record<string, number | null>;

export interface HolidayPeriod {
  name: string;
  startDate: string;
  endDate: string;
}

export interface WeekTemplate {
  id: string;
  name: string;
  days: (number | null)[];
}

export interface AppState {
  employees: Employee[];
  schedule: ScheduleMap;
  selectedMonth: number;
  selectedYear: number;
}
