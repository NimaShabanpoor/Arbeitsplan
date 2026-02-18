import { useState } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { Legend } from './components/Legend';
import { EmployeePanel } from './components/EmployeePanel';
import { useSchedule } from './hooks/useSchedule';

export default function App() {
  const {
    employees,
    schedule,
    selectedMonth,
    selectedYear,
    setDuty,
    updateEmployee,
    addEmployee,
    removeEmployee,
    navigateMonth,
    goToMonth,
    resetData,
  } = useSchedule();

  const [showEmployeePanel, setShowEmployeePanel] = useState(false);

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <Header
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onNavigate={navigateMonth}
        onGoToMonth={goToMonth}
        onReset={resetData}
        onToggleEmployees={() => setShowEmployeePanel(v => !v)}
        showEmployeePanel={showEmployeePanel}
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
    </div>
  );
}
