export interface ImportedEmployeePlan {
  employeeNr: number;
  values: (number | null)[];
}

function isIntegerToken(value: string): boolean {
  return /^-?\d+$/.test(value);
}

function trimTrailingNulls(values: (number | null)[]): (number | null)[] {
  let end = values.length;
  while (end > 0 && values[end - 1] === null) end -= 1;
  return values.slice(0, end);
}

export function parsePlanTsv(input: string): ImportedEmployeePlan[] {
  const lines = input
    .split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter(line => line.trim().length > 0);

  const parsed: ImportedEmployeePlan[] = [];

  for (const line of lines) {
    const cols = line.split('\t');
    if (cols.length < 6) continue;

    const nr = Number(cols[0]?.trim());
    if (!Number.isInteger(nr)) continue;

    const maybeAnrede = (cols[5] || '').trim();
    const startIdx = maybeAnrede !== '' && !isIntegerToken(maybeAnrede) ? 6 : 5;

    const values: (number | null)[] = [];
    for (let i = startIdx; i < cols.length; i += 1) {
      const cell = (cols[i] || '').trim();
      if (cell === '') {
        values.push(null);
      } else if (isIntegerToken(cell)) {
        values.push(Number(cell));
      } else {
        values.push(null);
      }
    }

    const compact = trimTrailingNulls(values);
    if (compact.length === 0) continue;
    parsed.push({ employeeNr: nr, values: compact });
  }

  return parsed;
}
