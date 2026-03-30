import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { Legend } from './components/Legend';
import { EmployeePanel } from './components/EmployeePanel';
import { TemplatePanel } from './components/TemplatePanel';
import { ExportDialog } from './components/ExportDialog';
import { LoginScreen } from './components/LoginScreen';
import { AdditionalInfoPanel } from './components/AdditionalInfoPanel';
import { PlanImportPanel } from './components/PlanImportPanel';
import { useSchedule } from './hooks/useSchedule';
import { authUsers } from './data/authUsers';
import { AuthUser } from './types';
import { dutyTypes } from './data/dutyTypes';

const STORAGE_KEY_AUTH = 'benedict_auth_user';
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveAuthUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    return;
  }
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const {
    employees,
    schedule,
    selectedMonth,
    selectedYear,
    templates,
    setDuty,
    updateEmployee,
    addEmployee,
    removeEmployee,
    navigateMonth,
    goToMonth,
    resetData,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
    importPlans,
  } = useSchedule();

  const [showEmployeePanel, setShowEmployeePanel] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadAuthUser);
  const [scrollToDate, setScrollToDate] = useState<string | null>(null);
  const [scrollToDateVersion, setScrollToDateVersion] = useState(0);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedDutyFilters, setSelectedDutyFilters] = useState<number[]>([]);
  const [showDutyFilterPanel, setShowDutyFilterPanel] = useState(false);
  const [showAdditionalInfoPanel, setShowAdditionalInfoPanel] = useState(false);
  const [showPlanImportPanel, setShowPlanImportPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<'calendar' | 'actions' | 'legend'>('calendar');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = (mobile: boolean) => setIsMobile(mobile);
    apply(media.matches);
    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const handleLogin = useCallback((username: string, password: string) => {
    const match = authUsers.find(
      user => user.username.toLowerCase() === username.toLowerCase() && user.password === password
    );
    if (!match) return false;

    const nextUser: AuthUser = {
      username: match.username,
      displayName: match.displayName,
      role: match.role,
    };
    setCurrentUser(nextUser);
    saveAuthUser(nextUser);
    return true;
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    saveAuthUser(null);
    setShowEmployeePanel(false);
    setShowTemplatePanel(false);
    setShowExportDialog(false);
  }, []);

  const handleGoToToday = useCallback(() => {
    const now = new Date();
    goToMonth(now.getMonth(), now.getFullYear());
    setScrollToDate(toDateKey(now));
    setScrollToDateVersion(v => v + 1);
  }, [goToMonth]);

  const handleDutyFilterToggle = useCallback((dutyNr: number) => {
    setSelectedDutyFilters(prev =>
      prev.includes(dutyNr) ? prev.filter(nr => nr !== dutyNr) : [...prev, dutyNr]
    );
  }, []);

  const clearDutyFilters = useCallback(() => {
    setSelectedDutyFilters([]);
  }, []);

  const protectedActions = useMemo(() => ({
    setDuty: (employeeNr: number, date: string, dutyNr: number | null) => {
      if (!isAdmin) return;
      setDuty(employeeNr, date, dutyNr);
    },
    resetData: () => {
      if (!isAdmin) {
        alert('Nur Admins duerfen den Plan zuruecksetzen.');
        return;
      }
      resetData();
    },
    saveTemplate: (tpl: Parameters<typeof saveTemplate>[0]) => {
      if (!isAdmin) return;
      saveTemplate(tpl);
    },
    deleteTemplate: (id: string) => {
      if (!isAdmin) return;
      deleteTemplate(id);
    },
    applyTemplate: (
      tpl: Parameters<typeof applyTemplate>[0],
      employeeNrs: Parameters<typeof applyTemplate>[1],
      startDate: Parameters<typeof applyTemplate>[2],
      endDate: Parameters<typeof applyTemplate>[3]
    ) => {
      if (!isAdmin) return;
      applyTemplate(tpl, employeeNrs, startDate, endDate);
    },
    updateEmployee: (emp: Parameters<typeof updateEmployee>[0]) => {
      if (!isAdmin) return;
      updateEmployee(emp);
    },
    addEmployee: (emp: Parameters<typeof addEmployee>[0]) => {
      if (!isAdmin) return;
      addEmployee(emp);
    },
    removeEmployee: (nr: number) => {
      if (!isAdmin) return;
      removeEmployee(nr);
    },
    importPlans: (plans: Parameters<typeof importPlans>[0], startDate: string) => {
      importPlans(plans, startDate);
    },
  }), [
    isAdmin,
    setDuty,
    resetData,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
    updateEmployee,
    addEmployee,
    removeEmployee,
    importPlans,
  ]);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-slate-100">
      <Header
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onNavigate={navigateMonth}
        onGoToMonth={goToMonth}
        onGoToToday={handleGoToToday}
        onReset={protectedActions.resetData}
        onToggleEmployees={() => {
          if (!isAdmin) return;
          setShowEmployeePanel(v => !v);
        }}
        onToggleTemplates={() => {
          if (!isAdmin) return;
          setShowTemplatePanel(v => !v);
        }}
        onToggleExport={() => setShowExportDialog(true)}
        onLogout={handleLogout}
        employeeSearch={employeeSearch}
        onEmployeeSearchChange={setEmployeeSearch}
        showEmployeePanel={showEmployeePanel}
        showTemplatePanel={showTemplatePanel}
        currentUser={currentUser}
        isAdmin={isAdmin}
        showActionBar={!isMobile}
      />

      <div className="shrink-0 bg-white border-b border-slate-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">
            Dienstfilter
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPlanImportPanel(true)}
              className="text-xs px-2.5 py-1 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
            >
              Excel einfuegen
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowAdditionalInfoPanel(true)}
                className="text-xs px-2.5 py-1 rounded-md border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
              >
                Zusatzinfos bearbeiten
              </button>
            )}
            <button
              onClick={() => setShowDutyFilterPanel(v => !v)}
              className="text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              {showDutyFilterPanel ? 'Filter ausblenden' : 'Filter anzeigen'}
            </button>
          </div>
        </div>
        {showDutyFilterPanel && (
          <div className="mt-2 border border-slate-200 rounded-md p-2 bg-white">
            <div className="flex items-center justify-end mb-1">
              <button
                onClick={clearDutyFilters}
                className="text-[10px] text-slate-500 hover:text-slate-700"
              >
                Zurücksetzen
              </button>
            </div>
            <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-md p-2 grid grid-cols-2 sm:grid-cols-4 gap-1">
              {dutyTypes.map(dt => (
                <label key={dt.nr} className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedDutyFilters.includes(dt.nr)}
                    onChange={() => handleDutyFilterToggle(dt.nr)}
                    className="rounded border-slate-300"
                  />
                  <span>{dt.nr} - {dt.shortName}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="shrink-0 bg-white border-b border-slate-200 px-3 py-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMobileSection('calendar')}
              className={`text-xs rounded-md px-2 py-2 font-semibold border ${
                mobileSection === 'calendar'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Kalender
            </button>
            <button
              onClick={() => setMobileSection('actions')}
              className={`text-xs rounded-md px-2 py-2 font-semibold border ${
                mobileSection === 'actions'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Aktionen
            </button>
            <button
              onClick={() => setMobileSection('legend')}
              className={`text-xs rounded-md px-2 py-2 font-semibold border ${
                mobileSection === 'legend'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Legende
            </button>
          </div>
        </div>
      )}

      {!isMobile && (
        <>
          <div className="flex-1 min-h-0">
            <CalendarGrid
              employees={employees}
              schedule={schedule}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onSetDuty={protectedActions.setDuty}
              canEdit={isAdmin}
              scrollToDate={scrollToDate}
              scrollToDateVersion={scrollToDateVersion}
              employeeSearchTerm={employeeSearch}
              selectedDutyFilters={selectedDutyFilters}
            />
          </div>
          <Legend />
        </>
      )}

      {isMobile && mobileSection === 'calendar' && (
        <div className="flex-1 min-h-0">
          <CalendarGrid
            employees={employees}
            schedule={schedule}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSetDuty={protectedActions.setDuty}
            canEdit={isAdmin}
            scrollToDate={scrollToDate}
            scrollToDateVersion={scrollToDateVersion}
            employeeSearchTerm={employeeSearch}
            selectedDutyFilters={selectedDutyFilters}
          />
        </div>
      )}

      {isMobile && mobileSection === 'legend' && <Legend />}

      {isMobile && mobileSection === 'actions' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="text-xs font-semibold text-slate-600">Monat wechseln</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-2 text-xs rounded-md border border-slate-300 bg-white"
              >
                Zurück
              </button>
              <select
                value={selectedMonth}
                onChange={e => goToMonth(Number(e.target.value), selectedYear)}
                className="flex-1 text-xs border border-slate-300 rounded-md px-2 py-2 bg-white"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => goToMonth(selectedMonth, Number(e.target.value))}
                className="w-24 text-xs border border-slate-300 rounded-md px-2 py-2 bg-white"
              >
                {Array.from({ length: 5 }, (_, i) => 2025 + i).map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigateMonth(1)}
                className="px-3 py-2 text-xs rounded-md border border-slate-300 bg-white"
              >
                Weiter
              </button>
            </div>
            <button
              onClick={handleGoToToday}
              className="w-full text-xs px-3 py-2 rounded-md bg-blue-600 text-white font-semibold"
            >
              Heute anzeigen
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowExportDialog(true)}
                className="text-xs px-3 py-2 rounded-md bg-emerald-600 text-white font-semibold"
              >
                Export
              </button>
              <button
                onClick={() => setShowPlanImportPanel(true)}
                className="text-xs px-3 py-2 rounded-md bg-cyan-600 text-white font-semibold"
              >
                Excel einfuegen
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowTemplatePanel(true)}
                  className="text-xs px-3 py-2 rounded-md bg-purple-600 text-white font-semibold"
                >
                  Vorlagen
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowEmployeePanel(true)}
                  className="text-xs px-3 py-2 rounded-md bg-slate-800 text-white font-semibold"
                >
                  Mitarbeiter
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm('Alle Daten auf Standardwerte zurücksetzen?')) {
                      protectedActions.resetData();
                    }
                  }}
                  className="text-xs px-3 py-2 rounded-md bg-amber-500 text-white font-semibold"
                >
                  Zurücksetzen
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-2 rounded-md bg-rose-600 text-white font-semibold"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmployeePanel && (
        <EmployeePanel
          employees={employees}
          onUpdate={protectedActions.updateEmployee}
          onAdd={protectedActions.addEmployee}
          onRemove={protectedActions.removeEmployee}
          onClose={() => setShowEmployeePanel(false)}
        />
      )}

      {showTemplatePanel && isAdmin && (
        <TemplatePanel
          employees={employees}
          templates={templates}
          onSaveTemplate={protectedActions.saveTemplate}
          onDeleteTemplate={protectedActions.deleteTemplate}
          onApplyTemplate={protectedActions.applyTemplate}
          onClose={() => setShowTemplatePanel(false)}
          canEdit={isAdmin}
        />
      )}

      {showAdditionalInfoPanel && isAdmin && (
        <AdditionalInfoPanel
          employees={employees}
          onUpdate={protectedActions.updateEmployee}
          onClose={() => setShowAdditionalInfoPanel(false)}
        />
      )}

      {showPlanImportPanel && (
        <PlanImportPanel
          onApply={protectedActions.importPlans}
          onClose={() => setShowPlanImportPanel(false)}
          defaultStartDate={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          employees={employees}
          schedule={schedule}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
