import { useCallback, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { Legend } from './components/Legend';
import { EmployeePanel } from './components/EmployeePanel';
import { TemplatePanel } from './components/TemplatePanel';
import { ExportDialog } from './components/ExportDialog';
import { LoginScreen } from './components/LoginScreen';
import { useSchedule } from './hooks/useSchedule';
import { authUsers } from './data/authUsers';
import { AuthUser } from './types';

const STORAGE_KEY_AUTH = 'benedict_auth_user';

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
  } = useSchedule();

  const [showEmployeePanel, setShowEmployeePanel] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadAuthUser);

  const isAdmin = currentUser?.role === 'admin';

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
  ]);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <Header
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onNavigate={navigateMonth}
        onGoToMonth={goToMonth}
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
        showEmployeePanel={showEmployeePanel}
        showTemplatePanel={showTemplatePanel}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

      <CalendarGrid
        employees={employees}
        schedule={schedule}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSetDuty={protectedActions.setDuty}
        canEdit={isAdmin}
      />

      <Legend />

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
