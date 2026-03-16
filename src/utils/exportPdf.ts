import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, ScheduleMap } from '../types';
import { dutyTypes, getDutyType } from '../data/dutyTypes';
import { makeKey } from '../data/scheduleData';

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function dateStr(day: number, month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function hasAnyDutyForDate(employees: Employee[], schedule: ScheduleMap, date: string): boolean {
  return employees.some(emp => schedule[makeKey(emp.nr, date)] !== null && schedule[makeKey(emp.nr, date)] !== undefined);
}

function hexToRgbArray(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length !== 6) return [0, 0, 0];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function drawLegend(doc: jsPDF, startY: number): void {
  doc.setFontSize(11);
  doc.text('Legende', 14, startY);

  autoTable(doc, {
    startY: startY + 3,
    head: [['Nr', 'Dienst', 'Arbeitszeit']],
    body: dutyTypes.map(dt => [String(dt.nr), dt.name, `${dt.startTime} - ${dt.endTime}`]),
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    didParseCell: data => {
      if (data.section !== 'body' || data.column.index !== 0) return;
      const dutyNr = Number(data.cell.raw);
      const dt = getDutyType(dutyNr);
      if (!dt) return;
      data.cell.styles.fillColor = hexToRgbArray(dt.color);
      data.cell.styles.textColor = hexToRgbArray(dt.textColor);
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.halign = 'center';
    },
  });
}

function drawMonthTable(doc: jsPDF, employees: Employee[], schedule: ScheduleMap, month: number, year: number): number {
  const active = employees.filter(e => e.aktiv);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const includedDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d =>
    hasAnyDutyForDate(active, schedule, dateStr(d, month, year))
  );

  doc.setFontSize(12);
  doc.text(`Dienstplan ${MONTH_NAMES[month]} ${year}`, 14, 14);

  if (includedDays.length === 0) {
    doc.setFontSize(10);
    doc.text('Keine eingetragenen Dienste in diesem Monat.', 14, 24);
    return 28;
  }

  const head = [
    'Nr',
    'Name / Vorname',
    'Funktion',
    'Standort',
    ...includedDays.map(d => {
      const date = new Date(year, month, d);
      return `${DAY_NAMES[date.getDay()]} ${String(d).padStart(2, '0')}`;
    }),
  ];

  const body = active.map(emp => {
    const base = [String(emp.nr), `${emp.name} ${emp.vorname}`, emp.funktion, emp.standort];
    const dutyCols = includedDays.map(d => {
      const duty = schedule[makeKey(emp.nr, dateStr(d, month, year))] ?? null;
      return duty !== null ? String(duty) : '';
    });
    return [...base, ...dutyCols];
  });

  autoTable(doc, {
    startY: 18,
    head: [head],
    body,
    styles: { fontSize: 6.5, cellPadding: 1, overflow: 'linebreak' },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 28 },
      3: { cellWidth: 26 },
    },
    margin: { left: 8, right: 8 },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: [0, 1, 2, 3],
    didParseCell: data => {
      if (data.section !== 'body' || data.column.index < 4 || !data.cell.raw) return;
      const dutyNr = Number(data.cell.raw);
      const dt = getDutyType(dutyNr);
      if (!dt) return;
      data.cell.styles.fillColor = hexToRgbArray(dt.color);
      data.cell.styles.textColor = hexToRgbArray(dt.textColor);
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.halign = 'center';
    },
  });

  return (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 20;
}

export function exportScheduleToPdf(
  employees: Employee[],
  schedule: ScheduleMap,
  month: number,
  year: number,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const tableEndY = drawMonthTable(doc, employees, schedule, month, year);
  const legendStartY = Math.min(tableEndY + 8, 180);
  drawLegend(doc, legendStartY);
  doc.save(`Dienstplan_Benedict_${MONTH_NAMES[month]}_${year}.pdf`);
}

export function exportFullScheduleToPdf(
  employees: Employee[],
  schedule: ScheduleMap,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let isFirst = true;
  let m = startMonth;
  let y = startYear;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const active = employees.filter(e => e.aktiv);
    const hasDutyInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      .some(d => hasAnyDutyForDate(active, schedule, dateStr(d, m, y)));

    if (hasDutyInMonth) {
      if (!isFirst) doc.addPage();
      drawMonthTable(doc, employees, schedule, m, y);
      isFirst = false;
    }

    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  if (isFirst) {
    doc.setFontSize(12);
    doc.text('Keine eingetragenen Dienste im gewählten Zeitraum.', 14, 20);
  }

  doc.addPage();
  drawLegend(doc, 16);
  doc.save(`Dienstplan_Benedict_${MONTH_NAMES[startMonth]}_${startYear}_bis_${MONTH_NAMES[endMonth]}_${endYear}.pdf`);
}
