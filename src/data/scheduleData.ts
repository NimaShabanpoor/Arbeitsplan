import { ScheduleMap } from '../types';

export function makeKey(employeeNr: number, date: string): string {
  return `${employeeNr}_${date}`;
}

function d(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function buildInitialSchedule(): ScheduleMap {
  const s: ScheduleMap = {};

  const feb26Dates = [
    d(1,2,2026), d(2,2,2026), d(3,2,2026), d(4,2,2026), d(5,2,2026), d(6,2,2026), d(7,2,2026),
    d(8,2,2026), d(9,2,2026), d(10,2,2026), d(11,2,2026), d(12,2,2026), d(13,2,2026), d(14,2,2026),
    d(15,2,2026), d(16,2,2026), d(17,2,2026), d(18,2,2026), d(19,2,2026), d(20,2,2026), d(21,2,2026),
    d(22,2,2026), d(23,2,2026), d(24,2,2026), d(25,2,2026), d(26,2,2026), d(27,2,2026), d(28,2,2026),
  ];

  const standardPattern: (number | null)[] = [
    99, 30, 5, 41, 5, 40, null,
    99, 5, 5, 5, 5, 5, null,
    99, 5, 5, 5, 5, 5, null,
    99, 5, 5, 41, 5, 40, null,
  ];

  const standardPatternLate: (number | null)[] = [
    99, 30, 5, 41, 10, 40, null,
    99, 5, 5, 5, 5, 5, null,
    99, 5, 5, 5, 5, 5, null,
    99, 5, 5, 41, 5, 40, null,
  ];

  const empData: { nr: number; values: (number | null)[] }[] = [
    { nr: 100, values: [99, 10, 5, 41, 5, 40, null, 99, 30, 30, 41, 16, 40, null, 99, 5, 5, 41, 5, 40, null, 99, 30, 30, 41, 30, 40, null] },
    { nr: 101, values: [99, 30, 5, 41, 10, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 102, values: [99, 30, 5, 41, 10, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 103, values: standardPattern },
    { nr: 104, values: standardPatternLate },
    { nr: 105, values: standardPattern },
    { nr: 106, values: [99, 16, 5, 41, 5, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 107, values: [99, 50, 50, 41, 50, 40, null, 99, 15, 15, 15, 15, 15, null, 99, 5, 5, 5, 5, 5, null, 99, 51, 51, 41, 51, 40, null] },
    { nr: 108, values: [99, 50, 10, 41, 10, 40, 52, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 51, 51, 41, 51, 40, 52] },
    { nr: 109, values: [99, 16, 16, 41, 51, 40, null, 99, 60, 60, 15, 15, 15, null, 99, 15, 15, 15, 15, 15, null, 99, 15, 15, 15, 15, 15, null] },
    { nr: 110, values: standardPattern },
    { nr: 111, values: [99, 51, 51, 41, 51, 40, 52, 99, 50, 50, 41, 50, 40, null, 99, 51, 51, 41, 51, 40, 52, 99, 50, 50, 41, 50, 40, null] },
    { nr: 112, values: [99, 51, 51, 41, 51, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 50, 50, 41, 50, 40, null] },
    { nr: 113, values: standardPatternLate },
    { nr: 114, values: [99, 45, 45, 41, 45, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 115, values: [99, 50, 10, 41, 10, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 51, 51, 41, 51, 40, null] },
    { nr: 116, values: [99, 45, 45, 41, 45, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 117, values: [99, 45, 45, 41, 45, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 118, values: [99, 45, 45, 41, 45, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 41, 5, 40, null] },
    { nr: 119, values: [99, 51, 51, 41, 51, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, null, 99, 50, 50, 41, 50, 40, null] },
    { nr: 121, values: [99, 30, 10, 41, 10, 40, null, 99, 5, 5, 5, 5, 5, null, 99, 5, 5, 5, 5, 5, 5, 99, 5, 5, 41, 5, 40, null] },
    { nr: 130, values: [99, 60, 60, 60, 60, 60, null, 99, 60, 60, 60, 60, 60, null, 99, 60, 60, 60, 60, 60, null, 99, 60, 60, 60, 60, 60, null] },
    { nr: 200, values: [99, 1, 1, 41, 1, 1, null, 99, 1, 1, 41, 1, 1, null, 99, 1, 1, 41, 1, 1, null, 99, 1, 1, 41, 1, 1, null] },
    { nr: 201, values: [99, 30, 30, 41, 40, 40, null, 99, 30, 30, 41, 40, 40, null, 99, 30, 30, 41, 40, 40, null, 99, 30, 30, 41, 40, 40, null] },
  ];

  for (const emp of empData) {
    for (let i = 0; i < Math.min(emp.values.length, feb26Dates.length); i++) {
      if (emp.values[i] !== null) {
        s[makeKey(emp.nr, feb26Dates[i])] = emp.values[i];
      }
    }
  }

  const mar26 = generateMonthFromPatterns(3, 2026);
  const apr26 = generateMonthFromPatterns(4, 2026);

  return { ...s, ...mar26, ...apr26 };
}

const weekPatterns: Record<number, (number | null)[]> = {
  100: [null, 30, 30, 41, 30, 40, null],
  101: [null, 5, 5, 41, 5, 40, null],
  102: [null, 5, 5, 41, 5, 40, null],
  103: [null, 5, 5, 41, 5, 40, null],
  104: [null, 5, 5, 41, 5, 40, null],
  105: [null, 5, 5, 41, 5, 40, null],
  106: [null, 5, 5, 41, 5, 40, null],
  107: [null, 50, 50, 41, 50, 40, null],
  108: [null, 50, 50, 41, 50, 40, null],
  109: [null, 15, 15, 15, 15, 40, 52],
  110: [null, 5, 5, 41, 5, 40, null],
  111: [null, 51, 51, 41, 51, 40, 52],
  112: [null, 51, 51, 41, 51, 40, null],
  113: [null, 5, 5, 41, 5, 40, null],
  114: [null, 5, 5, 41, 5, 40, null],
  115: [null, 51, 51, 41, 51, 40, null],
  116: [null, 5, 5, 41, 5, 40, null],
  117: [null, 5, 5, 41, 5, 40, null],
  118: [null, 5, 5, 41, 5, 40, null],
  119: [null, 51, 51, 41, 51, 40, null],
  121: [null, 5, 5, 41, 5, 40, null],
  130: [null, 60, 60, 60, 60, 60, null],
  200: [null, 1, 1, 41, 1, 1, null],
  201: [null, 30, 30, 41, 40, 40, null],
};

const patternEmpNrs = Object.keys(weekPatterns).map(Number);

function generateMonthFromPatterns(month: number, year: number): ScheduleMap {
  const s: ScheduleMap = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    const dateStr = d(day, month, year);

    for (const empNr of patternEmpNrs) {
      const pattern = weekPatterns[empNr];
      if (dow === 0) {
        s[makeKey(empNr, dateStr)] = 99;
      } else if (pattern[dow] !== null) {
        s[makeKey(empNr, dateStr)] = pattern[dow];
      }
    }
  }

  return s;
}
