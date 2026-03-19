import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Employee, ScheduleMap, DutyNoteMap } from '../types';
import { getDutyType } from '../data/dutyTypes';
import { makeKey } from '../data/scheduleData';
import { DutySelector } from './DutySelector';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const DAY_NAMES_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const ROW_HEIGHT = 30;

const FUNKTION_COLORS: Record<string, string> = {
  'Applikationsentwicklung': 'bg-blue-50 text-blue-700',
  'ICT-Fachmann': 'bg-emerald-50 text-emerald-700',
  'Plattformentwicklung': 'bg-purple-50 text-purple-700',
  'Betriebsökonom': 'bg-amber-50 text-amber-700',
  'Entwickler dig. Business': 'bg-rose-50 text-rose-700',
  'IPA/VPA Begleiter/Dozent': 'bg-cyan-50 text-cyan-700',
};

interface CalendarGridProps {
  employees: Employee[];
  schedule: ScheduleMap;
  selectedMonth: number;
  selectedYear: number;
  onSetDuty: (employeeNr: number, date: string, dutyNr: number | null) => void;
  onSetDutyNote: (employeeNr: number, date: string, note: string) => void;
  canEdit: boolean;
  dutyNotes: DutyNoteMap;
  scrollToDate: string | null;
  scrollToDateVersion: number;
  employeeSearchTerm: string;
  selectedDutyFilters: number[];
}

function formatDate(day: number, month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface DayInfo {
  day: number;
  month: number;
  year: number;
  dow: number;
  dateStr: string;
  isWeekend: boolean;
  isToday: boolean;
}

interface SelectorState {
  x: number;
  y: number;
  employeeNr: number;
  dateStr: string;
  employeeName: string;
  dateLabel: string;
}

const DutyCell = memo(function DutyCell({
  dutyNr,
  isWeekend,
  isToday,
  isVisible,
  note,
}: {
  dutyNr: number | null;
  isWeekend: boolean;
  isToday: boolean;
  isVisible: boolean;
  note?: string;
}) {
  const dutyType = dutyNr !== null && isVisible ? getDutyType(dutyNr) : null;

  return (
    <div
      className={`flex items-center justify-center ${
        isToday ? 'ring-1 ring-blue-400 ring-inset' : ''
      } ${!dutyType && isWeekend ? 'bg-slate-100' : ''}`}
      style={{ height: ROW_HEIGHT }}
    >
      {dutyType ? (
        <div
          className="w-full h-full relative flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: dutyType.color, color: dutyType.textColor }}
          title={`${dutyType.name} (${dutyType.startTime}–${dutyType.endTime})${note ? `\nHinweis: ${note}` : ''}`}
        >
          {dutyType.nr}
          {note && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-700" />}
        </div>
      ) : null}
    </div>
  );
});

export function CalendarGrid({
  employees,
  schedule,
  selectedMonth,
  selectedYear,
  onSetDuty,
  onSetDutyNote,
  canEdit,
  dutyNotes,
  scrollToDate,
  scrollToDateVersion,
  employeeSearchTerm,
  selectedDutyFilters,
}: CalendarGridProps) {
  const [selector, setSelector] = useState<SelectorState | null>(null);
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(false);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  useEffect(() => {
    setSelector(null);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const applyViewport = (mobile: boolean) => {
      setIsMobile(mobile);
    };

    applyViewport(media.matches);

    const onChange = (event: MediaQueryListEvent) => applyViewport(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (syncing.current) return;
    syncing.current = true;
    const from = source === 'left' ? leftRef.current : rightRef.current;
    const to = source === 'left' ? rightRef.current : leftRef.current;
    if (from && to) {
      to.scrollTop = from.scrollTop;
    }
    if (source === 'right' && rightRef.current && headerRef.current) {
      headerRef.current.scrollLeft = rightRef.current.scrollLeft;
    }
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  const days = useMemo<DayInfo[]>(() => {
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    const today = new Date();
    const todayStr = formatDate(today.getDate(), today.getMonth(), today.getFullYear());
    const result: DayInfo[] = [];

    for (
      let date = new Date(firstDayOfYear);
      date <= lastDayOfYear;
      date.setDate(date.getDate() + 1)
    ) {
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const dow = date.getDay();
      const dateStr = formatDate(day, month, year);
      result.push({
        day,
        month,
        year,
        dow,
        dateStr,
        isWeekend: dow === 0 || dow === 6,
        isToday: dateStr === todayStr,
      });
    }

    return result;
  }, [selectedYear]);

  useEffect(() => {
    const monthStart = formatDate(1, selectedMonth, selectedYear);
    const dayIndex = days.findIndex(day => day.dateStr === monthStart);
    if (dayIndex < 0) return;
    const nextScrollLeft = dayIndex * 40;
    if (headerRef.current) headerRef.current.scrollLeft = nextScrollLeft;
    if (rightRef.current) rightRef.current.scrollLeft = nextScrollLeft;
  }, [days, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!scrollToDate) return;
    const dayIndex = days.findIndex(day => day.dateStr === scrollToDate);
    if (dayIndex < 0) return;
    const nextScrollLeft = dayIndex * 40;
    if (headerRef.current) headerRef.current.scrollLeft = nextScrollLeft;
    if (rightRef.current) rightRef.current.scrollLeft = nextScrollLeft;
  }, [days, scrollToDate, scrollToDateVersion]);

  const activeEmployees = useMemo(() => {
    const term = employeeSearchTerm.trim().toLowerCase();
    return employees.filter(e => {
      if (!e.aktiv) return false;
      if (!term) return true;
      const searchText = `${e.nr} ${e.name} ${e.vorname} ${e.funktion} ${e.standort}`.toLowerCase();
      return searchText.includes(term);
    });
  }, [employees, employeeSearchTerm]);

  const filteredEmployees = useMemo(() => {
    if (selectedDutyFilters.length === 0) return activeEmployees;
    return activeEmployees.filter(emp =>
      days.some(day => {
        const dutyNr = schedule[makeKey(emp.nr, day.dateStr)];
        return typeof dutyNr === 'number' && selectedDutyFilters.includes(dutyNr);
      })
    );
  }, [activeEmployees, days, schedule, selectedDutyFilters]);

  const handleCellClick = useCallback((
    e: React.MouseEvent,
    empNr: number,
    dateStr: string,
    empName: string,
    dateLabel: string,
  ) => {
    if (!canEdit) return;
    e.stopPropagation();
    setSelector({
      x: e.clientX,
      y: e.clientY,
      employeeNr: empNr,
      dateStr,
      employeeName: empName,
      dateLabel,
    });
  }, [canEdit]);

  const handleDutySelect = useCallback((dutyNr: number | null) => {
    if (selector) {
      onSetDuty(selector.employeeNr, selector.dateStr, dutyNr);
      setSelector(null);
    }
  }, [selector, onSetDuty]);

  const closeSelector = useCallback(() => setSelector(null), []);
  const handleSaveNote = useCallback((note: string) => {
    if (!selector) return;
    onSetDutyNote(selector.employeeNr, selector.dateStr, note);
  }, [selector, onSetDutyNote]);

  const HEADER_HEIGHT = 36;
  const LEFT_PANEL_WIDTH = collapsed ? 52 : (isMobile ? 260 : 420);

  return (
    <div className="flex-1 min-h-0 overflow-hidden relative flex">
      {/* Left panel: Employee info */}
      <div
        className="shrink-0 min-h-0 flex flex-col border-r-2 border-slate-300 bg-white relative"
        style={{ width: LEFT_PANEL_WIDTH }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-1 z-50 bg-white border border-slate-300 rounded-full p-0.5 shadow-sm hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Info-Spalten einblenden' : 'Info-Spalten ausblenden'}
        >
          {collapsed
            ? <PanelLeftOpen className="w-3.5 h-3.5 text-slate-500" />
            : <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
          }
        </button>

        {/* Left header */}
        <div
          className="bg-slate-800 text-white flex items-center shrink-0 border-b border-slate-700"
          style={{ height: HEADER_HEIGHT }}
        >
          {collapsed ? (
            <div className="px-2 text-[10px] font-semibold w-full text-center">Nr</div>
          ) : isMobile ? (
            <>
              <div className="w-[42px] shrink-0 px-2 text-[10px] font-semibold border-r border-slate-700">Nr</div>
              <div className="flex-1 px-2 text-[10px] font-semibold">Name / Funktion</div>
            </>
          ) : (
            <>
              <div className="w-[42px] shrink-0 px-2 text-[10px] font-semibold border-r border-slate-700">Nr</div>
              <div className="w-[150px] shrink-0 px-2 text-[10px] font-semibold border-r border-slate-700">Name / Vorname</div>
              <div className="w-[120px] shrink-0 px-2 text-[10px] font-semibold border-r border-slate-700">Funktion</div>
              <div className="flex-1 px-2 text-[10px] font-semibold">Standort</div>
            </>
          )}
        </div>

        {/* Left body (synced vertical scroll) */}
        <div
          ref={leftRef}
          className="flex-1 overflow-y-scroll overflow-x-hidden overscroll-contain"
          onScroll={() => syncScroll('left')}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {filteredEmployees.length === 0 && (
            <div className="h-full flex items-center justify-center px-3 text-center text-xs text-slate-500">
              Keine passenden Mitarbeiter fuer den Filter.
            </div>
          )}
          {filteredEmployees.map((emp, rowIdx) => {
            const isEven = rowIdx % 2 === 0;
            const bg = isEven ? 'bg-white' : 'bg-slate-50';
            const funktionClass = FUNKTION_COLORS[emp.funktion] || 'bg-slate-50 text-slate-600';

            return (
              <div
                key={emp.nr}
                className={`flex items-center ${bg} border-b border-slate-200 hover:bg-blue-50/40`}
                style={{ height: ROW_HEIGHT }}
              >
                {collapsed ? (
                  <div className="w-full px-1 text-[10px] font-mono text-slate-500 text-center truncate" title={`${emp.name} ${emp.vorname}`}>
                    {emp.nr}
                  </div>
                ) : isMobile ? (
                  <>
                    <div className="w-[42px] shrink-0 px-2 text-[10px] font-mono text-slate-500 border-r border-slate-200">{emp.nr}</div>
                    <div className="flex-1 px-2 flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-medium text-slate-800 truncate" title={`${emp.name} ${emp.vorname}`}>
                        {emp.name} {emp.vorname}
                      </span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[42%] ${funktionClass}`}>
                        {emp.funktion}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[42px] shrink-0 px-2 text-[10px] font-mono text-slate-500 border-r border-slate-200">{emp.nr}</div>
                    <div className="w-[150px] shrink-0 px-2 text-[11px] font-medium text-slate-800 border-r border-slate-200 truncate" title={`${emp.name} ${emp.vorname}`}>
                      {emp.name} {emp.vorname}
                    </div>
                    <div className="w-[120px] shrink-0 px-1 border-r border-slate-200 flex items-center">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full truncate ${funktionClass}`}>
                        {emp.funktion}
                      </span>
                    </div>
                    <div className="flex-1 px-2 text-[10px] text-slate-500 truncate">
                      {emp.standort}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Calendar grid */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Calendar header (synced horizontal scroll) */}
        <div
          ref={headerRef}
          className="bg-slate-800 text-white shrink-0 overflow-hidden hide-scrollbar"
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex" style={{ width: days.length * 40 }}>
            {days.map(day => (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center justify-center w-[40px] shrink-0 border-r border-slate-700 ${
                  day.isToday ? 'bg-blue-600' : day.isWeekend ? 'bg-slate-700' : ''
                }`}
                style={{ height: HEADER_HEIGHT }}
              >
                <div className="text-[9px] font-medium leading-tight">
                  {DAY_NAMES_SHORT[day.dow]}
                </div>
                <div className={`text-[10px] font-bold leading-tight ${day.isToday ? 'text-yellow-300' : ''}`}>
                  {String(day.day).padStart(2, '0')}
                </div>
                {day.day === 1 && (
                  <div className="text-[8px] leading-tight text-slate-300">
                    {String(day.month + 1).padStart(2, '0')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar body (scrollable in both directions) */}
        <div
          ref={rightRef}
          className="flex-1 overflow-x-auto overflow-y-scroll overscroll-contain"
          onScroll={() => syncScroll('right')}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}
        >
          {filteredEmployees.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Keine passenden Eintraege im Kalender.
            </div>
          )}
          {filteredEmployees.map((emp, rowIdx) => {
            const isEven = rowIdx % 2 === 0;
            const bg = isEven ? 'bg-white' : 'bg-slate-50';

            return (
              <div
                key={emp.nr}
                className={`flex ${bg} border-b border-slate-200`}
                style={{ height: ROW_HEIGHT, width: days.length * 40 }}
              >
                {days.map(day => {
                  const dutyNr = schedule[makeKey(emp.nr, day.dateStr)] ?? null;
                  const note = dutyNotes[makeKey(emp.nr, day.dateStr)] || '';
                  const isVisibleDuty =
                    selectedDutyFilters.length === 0 || (dutyNr !== null && selectedDutyFilters.includes(dutyNr));
                  return (
                    <div
                      key={day.dateStr}
                      className={`w-[40px] shrink-0 border-r border-slate-200 ${
                        canEdit
                          ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset hover:z-10'
                          : 'cursor-not-allowed'
                      }`}
                      onClick={e => handleCellClick(
                        e,
                        emp.nr,
                        day.dateStr,
                        `${emp.name} ${emp.vorname}`,
                        `${DAY_NAMES_SHORT[day.dow]} ${String(day.day).padStart(2, '0')}.${String(day.month + 1).padStart(2, '0')}.${day.year}`
                      )}
                    >
                      <DutyCell
                        dutyNr={dutyNr}
                        isWeekend={day.isWeekend}
                        isToday={day.isToday}
                        isVisible={isVisibleDuty}
                        note={note}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selector && (
        <DutySelector
          x={selector.x}
          y={selector.y}
          currentDuty={schedule[makeKey(selector.employeeNr, selector.dateStr)] ?? null}
          currentNote={dutyNotes[makeKey(selector.employeeNr, selector.dateStr)] || ''}
          onSelect={handleDutySelect}
          onSaveNote={handleSaveNote}
          onClose={closeSelector}
          employeeName={selector.employeeName}
          dateLabel={selector.dateLabel}
        />
      )}
    </div>
  );
}
