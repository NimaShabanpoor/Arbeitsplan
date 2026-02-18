import { ChevronLeft, ChevronRight, RotateCcw, Users, CalendarDays, Copy, Download } from 'lucide-react';

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onNavigate: (dir: number) => void;
  onGoToMonth: (month: number, year: number) => void;
  onReset: () => void;
  onToggleEmployees: () => void;
  onToggleTemplates: () => void;
  onToggleExport: () => void;
  showEmployeePanel: boolean;
  showTemplatePanel: boolean;
}

export function Header({
  selectedMonth,
  selectedYear,
  onNavigate,
  onGoToMonth,
  onReset,
  onToggleEmployees,
  onToggleTemplates,
  onToggleExport,
  showEmployeePanel,
  showTemplatePanel,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold tracking-wide">Dienstkalender IT Bénédict Zürich</h1>
            <p className="text-xs text-slate-400">Dienstplan der Praktikanten von Werner Hutter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            <select
              value={selectedMonth}
              onChange={e => onGoToMonth(Number(e.target.value), selectedYear)}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={e => onGoToMonth(selectedMonth, Number(e.target.value))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => 2025 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNavigate(1)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-slate-600 mx-1" />

          <button
            onClick={() => {
              const now = new Date();
              onGoToMonth(now.getMonth(), now.getFullYear());
            }}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
          >
            Heute
          </button>

          <div className="w-px h-8 bg-slate-600 mx-1" />

          <button
            onClick={onToggleTemplates}
            className={`p-2 rounded-lg transition-colors ${showTemplatePanel ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
            title="Wochenvorlagen"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleExport}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Als Excel exportieren"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleEmployees}
            className={`p-2 rounded-lg transition-colors ${showEmployeePanel ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
            title="Mitarbeiterverwaltung"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              if (confirm('Alle Daten auf Standardwerte zurücksetzen?')) {
                onReset();
              }
            }}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Daten zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="text-sm font-semibold text-blue-300">
          {MONTHS[selectedMonth]} {selectedYear}
        </div>
      </div>
    </header>
  );
}
