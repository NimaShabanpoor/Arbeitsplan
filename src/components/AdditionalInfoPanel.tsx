import { useMemo, useState } from 'react';
import { X, Save, Wand2 } from 'lucide-react';
import { Employee } from '../types';

interface AdditionalInfoPanelProps {
  employees: Employee[];
  onUpdate: (emp: Employee) => void;
  onClose: () => void;
}

type AdditionalInfoField =
  | 'pzvKd'
  | 'totalZuweisungen'
  | 'ferienguthaben'
  | 'restferien'
  | 'krankInProzent'
  | 'support'
  | 'supportAktiv'
  | 'ferien2026';

const NUMERIC_FIELDS: AdditionalInfoField[] = [
  'totalZuweisungen',
  'ferienguthaben',
  'restferien',
  'krankInProzent',
  'ferien2026',
];

function toEditableRows(employees: Employee[]): Employee[] {
  return employees.map(emp => ({
    ...emp,
    dienstStatistik: { ...(emp.dienstStatistik || {}) },
  }));
}

export function AdditionalInfoPanel({ employees, onUpdate, onClose }: AdditionalInfoPanelProps) {
  const [rows, setRows] = useState<Employee[]>(() => toEditableRows(employees));
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(emp => {
      const fullName = `${emp.name} ${emp.vorname}`.toLowerCase();
      return (
        fullName.includes(term) ||
        emp.name.toLowerCase().includes(term) ||
        emp.vorname.toLowerCase().includes(term) ||
        String(emp.nr).includes(term)
      );
    });
  }, [rows, search]);

  const setField = (nr: number, field: AdditionalInfoField, value: string) => {
    setRows(prev => prev.map(emp => {
      if (emp.nr !== nr) return emp;
      if (NUMERIC_FIELDS.includes(field)) {
        return {
          ...emp,
          [field]: value === '' ? undefined : Number(value),
        };
      }
      return {
        ...emp,
        [field]: value as Employee[typeof field],
      };
    }));
  };

  const autoFill = () => {
    if (!confirm('Sollen leere Zusatzinfos automatisch mit Standardwerten ausgefüllt werden?')) {
      return;
    }
    setRows(prev => prev.map(emp => ({
      ...emp,
      totalZuweisungen: emp.totalZuweisungen ?? 0,
      ferienguthaben: emp.ferienguthaben ?? 0,
      restferien: emp.restferien ?? 0,
      krankInProzent: emp.krankInProzent ?? 0,
      ferien2026: emp.ferien2026 ?? 0,
      support: emp.support || 'N',
      supportAktiv: emp.supportAktiv || 'N',
    })));
  };

  const saveAll = () => {
    if (!confirm('Alle Zusatzinfos speichern?')) return;
    rows.forEach(emp => onUpdate(emp));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[min(1100px,100%)] bg-white shadow-2xl h-full overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold">Zusatzinfos bearbeiten</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 p-3 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Mitarbeiter suchen (Name oder Nr)"
              className="w-full sm:max-w-sm text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={autoFill}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Auto-Ausfüllen (mit Bestätigung)
              </button>
              <button
                onClick={saveAll}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
              >
                <Save className="w-3.5 h-3.5" />
                Alles speichern
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Auto-Ausfüllen setzt nur leere Werte auf Standardwerte (Zahlen = 0, Support = N).
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="min-w-[980px] w-full text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-2 py-2 border-b border-slate-200">Mitarbeiter</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">100 PZV / 101 KD</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Total</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Ferienguthaben</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Restferien</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Krank in %</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Support</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Support aktiv</th>
                <th className="text-left px-2 py-2 border-b border-slate-200">Ferien 2026</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(emp => (
                <tr key={emp.nr} className="odd:bg-white even:bg-slate-50">
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <div className="font-semibold text-slate-800">{emp.name} {emp.vorname}</div>
                    <div className="text-[10px] text-slate-500">#{emp.nr}</div>
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      value={emp.pzvKd || ''}
                      onChange={e => setField(emp.nr, 'pzvKd', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      type="number"
                      value={emp.totalZuweisungen ?? ''}
                      onChange={e => setField(emp.nr, 'totalZuweisungen', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      type="number"
                      value={emp.ferienguthaben ?? ''}
                      onChange={e => setField(emp.nr, 'ferienguthaben', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      type="number"
                      value={emp.restferien ?? ''}
                      onChange={e => setField(emp.nr, 'restferien', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      type="number"
                      step="0.1"
                      value={emp.krankInProzent ?? ''}
                      onChange={e => setField(emp.nr, 'krankInProzent', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <select
                      value={emp.support || ''}
                      onChange={e => setField(emp.nr, 'support', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">-</option>
                      <option value="X">X</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <select
                      value={emp.supportAktiv || ''}
                      onChange={e => setField(emp.nr, 'supportAktiv', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">-</option>
                      <option value="X">X</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5 border-b border-slate-100">
                    <input
                      type="number"
                      value={emp.ferien2026 ?? ''}
                      onChange={e => setField(emp.nr, 'ferien2026', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
