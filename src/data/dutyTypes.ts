import { DutyType } from '../types';

export const dutyTypes: DutyType[] = [
  { nr: 1,  name: 'Normal',                shortName: 'Norm',  startTime: '08:00', endTime: '16:30', color: '#3b82f6', textColor: '#ffffff' },
  { nr: 5,  name: 'Zimmerkontrolle',       shortName: 'ZK',    startTime: '07:00', endTime: '15:30', color: '#06b6d4', textColor: '#ffffff' },
  { nr: 10, name: 'zu spät',               shortName: 'zSp',   startTime: '08:00', endTime: '16:30', color: '#f97316', textColor: '#ffffff' },
  { nr: 14, name: 'Kursstart',             shortName: 'KS',    startTime: '07:45', endTime: '15:45', color: '#8b5cf6', textColor: '#ffffff' },
  { nr: 15, name: 'Ferien',                shortName: 'Fe',    startTime: '07:00', endTime: '19:30', color: '#22c55e', textColor: '#ffffff' },
  { nr: 16, name: 'Krank',                 shortName: 'Kr',    startTime: '07:00', endTime: '19:30', color: '#ef4444', textColor: '#ffffff' },
  { nr: 17, name: 'VM Komp 1/2 Tg',       shortName: 'VMK',   startTime: '08:00', endTime: '12:00', color: '#fb923c', textColor: '#ffffff' },
  { nr: 18, name: 'NM Komp 1/2 Tg',       shortName: 'NMK',   startTime: '13:00', endTime: '17:00', color: '#fdba74', textColor: '#1e293b' },
  { nr: 19, name: 'Kompensation 1Tg',      shortName: 'Ko',    startTime: '07:00', endTime: '19:30', color: '#eab308', textColor: '#1e293b' },
  { nr: 20, name: 'VPA/IPA Vorbereitung',  shortName: 'VPA',   startTime: '08:00', endTime: '16:30', color: '#ec4899', textColor: '#ffffff' },
  { nr: 30, name: 'Projektarbeit',         shortName: 'Proj',  startTime: '08:00', endTime: '16:30', color: '#6366f1', textColor: '#ffffff' },
  { nr: 40, name: 'Schule',                shortName: 'Sch',   startTime: '08:00', endTime: '16:30', color: '#f59e0b', textColor: '#1e293b' },
  { nr: 41, name: 'Praktikantentag ZH',    shortName: 'PT',    startTime: '09:00', endTime: '16:30', color: '#14b8a6', textColor: '#ffffff' },
  { nr: 45, name: 'Arbeiten gem.OV',       shortName: 'OV',    startTime: '08:00', endTime: '16:30', color: '#64748b', textColor: '#ffffff' },
  { nr: 50, name: 'FD Support',            shortName: 'FD',    startTime: '07:15', endTime: '14:30', color: '#10b981', textColor: '#ffffff' },
  { nr: 51, name: 'SD Support',            shortName: 'SD',    startTime: '12:15', endTime: '19:30', color: '#0ea5e9', textColor: '#ffffff' },
  { nr: 52, name: 'SA Support',            shortName: 'SA',    startTime: '08:00', endTime: '13:30', color: '#7c3aed', textColor: '#ffffff' },
  { nr: 60, name: 'Sonderdienst',          shortName: 'So',    startTime: '09:00', endTime: '12:00', color: '#f43f5e', textColor: '#ffffff' },
  { nr: 99, name: 'Schule geschlossen',    shortName: 'gesch', startTime: '07:00', endTime: '19:30', color: '#94a3b8', textColor: '#1e293b' },
];

export const dutyTypeMap = new Map(dutyTypes.map(dt => [dt.nr, dt]));

export function getDutyType(nr: number): DutyType | undefined {
  return dutyTypeMap.get(nr);
}
