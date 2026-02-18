import { useState } from 'react';
import { Employee, ScheduleMap } from '../types';
import { exportScheduleToExcel, exportFullScheduleToExcel } from '../utils/exportExcel';
import { X, Download, FileSpreadsheet } from 'lucide-react';

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

interface ExportDialogProps {
  employees: Employee[];
  schedule: ScheduleMap;
  selectedMonth: number;
  selectedYear: number;
  onClose: () => void;
}

export function ExportDialog({ employees, schedule, selectedMonth, selectedYear, onClose }: ExportDialogProps) {
  const [exportType, setExportType] = useState<'month' | 'range'>('month');
  const [startMonth, setStartMonth] = useState(selectedMonth);
  const [startYear, setStartYear] = useState(selectedYear);
  const [endMonth, setEndMonth] = useState(selectedMonth);
  const [endYear, setEndYear] = useState(selectedYear);

  const handleExport = () => {
    if (exportType === 'month') {
      exportScheduleToExcel(employees, schedule, selectedMonth, selectedYear);
    } else {
      if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
        alert('Startmonat muss vor dem Endmonat liegen.');
        return;
      }
      exportFullScheduleToExcel(employees, schedule, startMonth, startYear, endMonth, endYear);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Arbeitsplan exportieren
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setExportType('month')}
              className={`flex-1 text-sm py-2 rounded-lg border-2 font-medium transition-colors ${
                exportType === 'month'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Aktueller Monat
            </button>
            <button
              onClick={() => setExportType('range')}
              className={`flex-1 text-sm py-2 rounded-lg border-2 font-medium transition-colors ${
                exportType === 'range'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Mehrere Monate
            </button>
          </div>

          {exportType === 'month' ? (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-600">Wird exportiert:</div>
              <div className="text-lg font-bold text-slate-800">{MONTHS[selectedMonth]} {selectedYear}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Von</label>
                <div className="flex gap-2">
                  <select
                    value={startMonth}
                    onChange={e => setStartMonth(Number(e.target.value))}
                    className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select
                    value={startYear}
                    onChange={e => setStartYear(Number(e.target.value))}
                    className="w-24 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => 2025 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Bis</label>
                <div className="flex gap-2">
                  <select
                    value={endMonth}
                    onChange={e => setEndMonth(Number(e.target.value))}
                    className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select
                    value={endYear}
                    onChange={e => setEndYear(Number(e.target.value))}
                    className="w-24 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => 2025 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
          >
            <Download className="w-4 h-4" /> Als Excel herunterladen
          </button>
        </div>
      </div>
    </div>
  );
}
