import { useState } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { Legend } from './components/Legend';
import { EmployeePanel } from './components/EmployeePanel';
import { TemplatePanel } from './components/TemplatePanel';
import { ExportDialog } from './components/ExportDialog';
import { useSchedule } from './hooks/useSchedule';

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

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <Header
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onNavigate={navigateMonth}
        onGoToMonth={goToMonth}
        onReset={resetData}
        onToggleEmployees={() => setShowEmployeePanel(v => !v)}
        onToggleTemplates={() => setShowTemplatePanel(v => !v)}
        onToggleExport={() => setShowExportDialog(true)}
        showEmployeePanel={showEmployeePanel}
        showTemplatePanel={showTemplatePanel}
      />

      <CalendarGrid
        employees={employees}
        schedule={schedule}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSetDuty={setDuty}
      />

      <Legend />

      {showEmployeePanel && (
        <EmployeePanel
          employees={employees}
          onUpdate={updateEmployee}
          onAdd={addEmployee}
          onRemove={removeEmployee}
          onClose={() => setShowEmployeePanel(false)}
        />
      )}

      {showTemplatePanel && (
        <TemplatePanel
          employees={employees}
          templates={templates}
          onSaveTemplate={saveTemplate}
          onDeleteTemplate={deleteTemplate}
          onApplyTemplate={applyTemplate}
          onClose={() => setShowTemplatePanel(false)}
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
