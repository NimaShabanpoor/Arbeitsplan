import { ChevronLeft, ChevronRight, RotateCcw, Users, CalendarDays, Copy, Download, LogOut, Search, X } from 'lucide-react';
import { AuthUser } from '../types';

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onNavigate: (dir: number) => void;
  onGoToMonth: (month: number, year: number) => void;
  onGoToToday: () => void;
  onReset: () => void;
  onToggleEmployees: () => void;
  onToggleTemplates: () => void;
  onToggleExport: () => void;
  onLogout: () => void;
  employeeSearch: string;
  onEmployeeSearchChange: (value: string) => void;
  showEmployeePanel: boolean;
  showTemplatePanel: boolean;
  currentUser: AuthUser;
  isAdmin: boolean;
  showActionBar?: boolean;
}

export function Header({
  selectedMonth,
  selectedYear,
  onNavigate,
  onGoToMonth,
  onGoToToday,
  onReset,
  onToggleEmployees,
  onToggleTemplates,
  onToggleExport,
  onLogout,
  employeeSearch,
  onEmployeeSearchChange,
  showEmployeePanel,
  showTemplatePanel,
  currentUser,
  isAdmin,
  showActionBar = true,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="px-3 py-3 md:px-4 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5 md:gap-3">
          <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-blue-400 shrink-0" />
          <div>
            <h1 className="text-sm md:text-lg font-bold tracking-wide">Dienstkalender IT Bénédict Zürich</h1>
            <p className="hidden sm:block text-xs text-slate-400">Dienstplan der Praktikanten von Werner Hutter</p>
          </div>
        </div>

        {showActionBar && (
          <div className="w-full md:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
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
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
          >
            Heute
          </button>

          <div className="w-px h-8 bg-slate-600 mx-1" />

          {isAdmin && (
            <button
              onClick={onToggleTemplates}
              className={`p-2 rounded-lg transition-colors ${showTemplatePanel ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
              title="Wochenvorlagen"
            >
              <Copy className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onToggleExport}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Als PDF exportieren"
          >
            <Download className="w-5 h-5" />
          </button>

          {isAdmin && (
            <button
              onClick={onToggleEmployees}
              className={`p-2 rounded-lg transition-colors ${showEmployeePanel ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              title="Mitarbeiterverwaltung"
            >
              <Users className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Alle Daten auf Standardwerte zurücksetzen?')) {
                onReset();
              }
            }}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title="Daten zurücksetzen"
            disabled={!isAdmin}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-slate-600 mx-1" />

          <div className="text-right mr-1">
            <div className="text-[11px] text-slate-300 leading-tight">{currentUser.displayName}</div>
            <div className={`text-[10px] leading-tight ${isAdmin ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isAdmin ? 'Admin' : 'Mitarbeiter'}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-5 h-5" />
          </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm font-semibold text-blue-300">
            {MONTHS[selectedMonth]} {selectedYear}
          </div>
          <div className="w-full sm:w-72">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={employeeSearch}
                onChange={e => onEmployeeSearchChange(e.target.value)}
                placeholder="Mitarbeiter suchen..."
                className="w-full h-8 rounded-lg bg-slate-700/80 border border-slate-600 pl-8 pr-8 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {employeeSearch && (
                <button
                  onClick={() => onEmployeeSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
                  title="Suche leeren"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
