import { useMemo, useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import { parsePlanTsv, ImportedEmployeePlan } from '../utils/planImport';

interface PlanImportPanelProps {
  onApply: (plans: ImportedEmployeePlan[], startDate: string) => void;
  onClose: () => void;
  defaultStartDate: string;
}

export function PlanImportPanel({ onApply, onClose, defaultStartDate }: PlanImportPanelProps) {
  const [raw, setRaw] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);

  const parsed = useMemo(() => parsePlanTsv(raw), [raw]);

  const handleApply = () => {
    if (parsed.length === 0) {
      alert('Keine gueltigen Zeilen erkannt. Bitte Excel-Tabelleninhalt einfuegen.');
      return;
    }
    if (!confirm(`Plan fuer ${parsed.length} Mitarbeitende ab ${startDate} uebernehmen?`)) {
      return;
    }
    onApply(parsed, startDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[min(980px,100%)] h-full bg-white shadow-2xl flex flex-col">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold">Dienstplan aus Excel einfuegen</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 space-y-3">
          <p className="text-xs text-slate-600">
            Inhalt aus Excel kopieren und hier einfuegen (tab-getrennt). Leere Zellen bleiben leer.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="text-xs text-slate-600">Startdatum</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-sm border border-slate-300 rounded-md px-2 py-1.5 w-fit"
            />
            <div className="text-xs text-slate-500">
              Der erste Dienstwert wird auf dieses Datum gesetzt.
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 min-h-0 flex flex-col gap-3">
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="Hier Excel-Inhalt einfuegen (Strg+V)..."
            className="flex-1 min-h-0 w-full border border-slate-300 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Erkannt: <span className="font-semibold">{parsed.length}</span> Mitarbeitende
            </div>
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              <Upload className="w-3.5 h-3.5" />
              Plan uebernehmen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
