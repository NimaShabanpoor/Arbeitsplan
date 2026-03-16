import * as XLSX from 'xlsx';
import { Employee, ScheduleMap } from '../types';
import { getDutyType, dutyTypes } from '../data/dutyTypes';
import { makeKey } from '../data/scheduleData';

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function dateStr(day: number, month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return h.length === 6 ? h.toUpperCase() : '000000';
}

function hasAnyDutyForDate(employees: Employee[], schedule: ScheduleMap, date: string): boolean {
  return employees.some(emp => schedule[makeKey(emp.nr, date)] !== null && schedule[makeKey(emp.nr, date)] !== undefined);
}

export function exportScheduleToExcel(
  employees: Employee[],
  schedule: ScheduleMap,
  month: number,
  year: number,
) {
  const active = employees.filter(e => e.aktiv);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const includedDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d =>
    hasAnyDutyForDate(active, schedule, dateStr(d, month, year))
  );

  const wb = XLSX.utils.book_new();

  const headerRow1 = ['Nr', 'Name / Vorname', 'Funktion', 'Standort'];
  for (const d of includedDays) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    headerRow1.push(`${DAY_NAMES[dow]} ${String(d).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}`);
  }

  const rows: (string | number | null)[][] = [];

  rows.push([`Dienstkalender IT Bénédict Zürich - ${MONTH_NAMES[month]} ${year}`]);
  rows.push([]);
  rows.push(headerRow1);

  for (const emp of active) {
    const row: (string | number | null)[] = [
      emp.nr,
      `${emp.name} ${emp.vorname}`,
      emp.funktion,
      emp.standort,
    ];
    for (const d of includedDays) {
      const key = makeKey(emp.nr, dateStr(d, month, year));
      const duty = schedule[key] ?? null;
      if (duty !== null) {
        const dt = getDutyType(duty);
        row.push(dt ? `${dt.nr}` : String(duty));
      } else {
        row.push('');
      }
    }
    rows.push(row);
  }

  rows.push([]);
  rows.push(['Legende']);
  rows.push(['Nr', 'Dienst', 'Arbeitszeit']);
  for (const dt of dutyTypes) {
    rows.push([dt.nr, dt.name, `${dt.startTime} - ${dt.endTime}`]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    ...Array(includedDays.length).fill({ wch: 8 }),
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ];

  const headerRowIdx = 2;
  for (let c = 0; c < headerRow1.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        fill: { fgColor: { rgb: '1E293B' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 9 },
        alignment: { horizontal: 'center' },
      };
    }
  }

  for (let rowIdx = 0; rowIdx < active.length; rowIdx++) {
    for (let dayCol = 0; dayCol < includedDays.length; dayCol++) {
      const r = headerRowIdx + 1 + rowIdx;
      const c = 4 + dayCol;
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (cell && cell.v) {
        const dutyNr = Number(cell.v);
        const dt = getDutyType(dutyNr);
        if (dt) {
          cell.s = {
            fill: { fgColor: { rgb: hexToRgb(dt.color) } },
            font: { color: { rgb: hexToRgb(dt.textColor) }, bold: true, sz: 9 },
            alignment: { horizontal: 'center' },
          };
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, `${MONTH_NAMES[month]} ${year}`);

  const fileName = `Dienstplan_Benedict_${MONTH_NAMES[month]}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportFullScheduleToExcel(
  employees: Employee[],
  schedule: ScheduleMap,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
) {
  const wb = XLSX.utils.book_new();
  const active = employees.filter(e => e.aktiv);

  let m = startMonth;
  let y = startYear;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const includedDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d =>
      hasAnyDutyForDate(active, schedule, dateStr(d, m, y))
    );

    if (includedDays.length === 0) {
      m++;
      if (m > 11) { m = 0; y++; }
      continue;
    }

    const headerRow = ['Nr', 'Name / Vorname', 'Funktion', 'Standort'];
    for (const d of includedDays) {
      const date = new Date(y, m, d);
      const dow = date.getDay();
      headerRow.push(`${DAY_NAMES[dow]} ${String(d).padStart(2, '0')}`);
    }

    const rows: (string | number | null)[][] = [];
    rows.push([`${MONTH_NAMES[m]} ${y}`]);
    rows.push([]);
    rows.push(headerRow);

    for (const emp of active) {
      const row: (string | number | null)[] = [
        emp.nr,
        `${emp.name} ${emp.vorname}`,
        emp.funktion,
        emp.standort,
      ];
      for (const d of includedDays) {
        const key = makeKey(emp.nr, dateStr(d, m, y));
        const duty = schedule[key] ?? null;
        row.push(duty !== null ? String(duty) : '');
      }
      rows.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 22 }, { wch: 22 }, { wch: 18 },
      ...Array(includedDays.length).fill({ wch: 8 }),
    ];

    const sheetName = `${MONTH_NAMES[m].slice(0, 3)} ${y}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    m++;
    if (m > 11) { m = 0; y++; }
  }

  const fileName = `Dienstplan_Benedict_${MONTH_NAMES[startMonth]}_${startYear}_bis_${MONTH_NAMES[endMonth]}_${endYear}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
