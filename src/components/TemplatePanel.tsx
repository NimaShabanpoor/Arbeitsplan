import { useState, useCallback } from 'react';
import { Employee, WeekTemplate } from '../types';
import { dutyTypes, getDutyType } from '../data/dutyTypes';
import { X, Plus, Trash2, Copy, Check, CalendarRange } from 'lucide-react';

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

interface TemplatePanelProps {
  employees: Employee[];
  templates: WeekTemplate[];
  onSaveTemplate: (tpl: WeekTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplate: (tpl: WeekTemplate, employeeNrs: number[], startDate: string, endDate: string) => void;
  onClose: () => void;
  canEdit: boolean;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function DutyDropdown({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full text-xs border border-slate-300 rounded-md px-1 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={value !== null && getDutyType(value) ? {
        backgroundColor: getDutyType(value)!.color,
        color: getDutyType(value)!.textColor,
        fontWeight: 700,
      } : {}}
    >
      <option value="">—</option>
      {dutyTypes.map(dt => (
        <option key={dt.nr} value={dt.nr}>{dt.nr} {dt.name}</option>
      ))}
    </select>
  );
}

export function TemplatePanel({
  employees,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  onClose,
  canEdit,
}: TemplatePanelProps) {
  const [mode, setMode] = useState<'list' | 'edit' | 'apply'>('list');
  const [editTemplate, setEditTemplate] = useState<WeekTemplate>({
    id: '',
    name: '',
    days: [null, null, null, null, null, null, null],
  });
  const [applyTemplate, setApplyTemplate] = useState<WeekTemplate | null>(null);
  const [selectedEmps, setSelectedEmps] = useState<Set<number>>(new Set());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const activeEmployees = employees.filter(e => e.aktiv);

  const handleNewTemplate = useCallback(() => {
    if (!canEdit) return;
    setEditTemplate({
      id: generateId(),
      name: '',
      days: [null, null, null, null, null, null, null],
    });
    setMode('edit');
  }, [canEdit]);

  const handleEditExisting = useCallback((tpl: WeekTemplate) => {
    if (!canEdit) return;
    setEditTemplate({ ...tpl, days: [...tpl.days] });
    setMode('edit');
  }, [canEdit]);

  const handleSave = useCallback(() => {
    if (!canEdit) return;
    if (!editTemplate.name.trim()) {
      alert('Bitte Vorlagenname eingeben.');
      return;
    }
    onSaveTemplate(editTemplate);
    setMode('list');
  }, [canEdit, editTemplate, onSaveTemplate]);

  const handleStartApply = useCallback((tpl: WeekTemplate) => {
    if (!canEdit) return;
    setApplyTemplate(tpl);
    setSelectedEmps(new Set());
    setStartDate('');
    setEndDate('');
    setMode('apply');
  }, [canEdit]);

  const handleApply = useCallback(() => {
    if (!canEdit) return;
    if (!applyTemplate) return;
    if (selectedEmps.size === 0) {
      alert('Bitte mindestens einen Mitarbeiter auswählen.');
      return;
    }
    if (!startDate || !endDate) {
      alert('Bitte Start- und Enddatum eingeben.');
      return;
    }
    if (startDate > endDate) {
      alert('Startdatum muss vor dem Enddatum liegen.');
      return;
    }
    onApplyTemplate(applyTemplate, Array.from(selectedEmps), startDate, endDate);
    setMode('list');
  }, [canEdit, applyTemplate, selectedEmps, startDate, endDate, onApplyTemplate]);

  const toggleEmp = (nr: number) => {
    setSelectedEmps(prev => {
      const next = new Set(prev);
      if (next.has(nr)) next.delete(nr);
      else next.add(nr);
      return next;
    });
  };

  const selectAllEmps = () => {
    setSelectedEmps(new Set(activeEmployees.map(e => e.nr)));
  };

  const deselectAllEmps = () => {
    setSelectedEmps(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-[520px] bg-white shadow-2xl h-full overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Wochenvorlagen
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        {!canEdit && (
          <div className="px-4 py-2 text-xs bg-amber-50 text-amber-700 border-b border-amber-200">
            Nur Admins duerfen Vorlagen erstellen, bearbeiten, loeschen oder anwenden.
          </div>
        )}

        {mode === 'list' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {templates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Copy className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Noch keine Vorlagen erstellt.</p>
                <p className="text-xs mt-1">Erstelle eine Wochenvorlage, um Dienstpläne schnell zuzuweisen.</p>
              </div>
            ) : (
              templates.map(tpl => (
                <div key={tpl.id} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">{tpl.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartApply(tpl)}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!canEdit}
                      >
                        <CalendarRange className="w-3 h-3" /> Anwenden
                      </button>
                      <button
                        onClick={() => handleEditExisting(tpl)}
                        className="text-[11px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!canEdit}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Vorlage "${tpl.name}" löschen?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        disabled={!canEdit}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_LABELS.map((label, i) => {
                      const dt = tpl.days[i] !== null ? getDutyType(tpl.days[i]!) : null;
                      return (
                        <div key={label} className="text-center">
                          <div className="text-[9px] text-slate-400 font-medium mb-0.5">{label}</div>
                          <div
                            className="rounded text-[10px] font-bold py-1"
                            style={dt ? { backgroundColor: dt.color, color: dt.textColor } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}
                          >
                            {dt ? dt.nr : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mode === 'edit' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <button onClick={() => setMode('list')} className="text-xs text-blue-600 hover:text-blue-500">&larr; Zurück zur Liste</button>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Vorlagenname</label>
              <input
                value={editTemplate.name}
                onChange={e => setEditTemplate(t => ({ ...t, name: e.target.value }))}
                placeholder="z.B. Standard-Woche Applikationsentwicklung"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">Wochenmuster (Mo–So)</label>
              <div className="grid grid-cols-7 gap-2">
                {DAY_LABELS.map((label, i) => (
                  <div key={label}>
                    <div className="text-[10px] text-slate-500 font-semibold text-center mb-1">{label}</div>
                    <DutyDropdown
                      value={editTemplate.days[i]}
                      onChange={v => {
                        setEditTemplate(t => {
                          const next = { ...t, days: [...t.days] };
                          next.days[i] = v;
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="text-xs font-semibold text-slate-600">Vorschau:</div>
              <div className="flex gap-1">
                {editTemplate.days.map((d, i) => {
                  const dt = d !== null ? getDutyType(d) : null;
                  return (
                    <div
                      key={i}
                      className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold"
                      style={dt ? { backgroundColor: dt.color, color: dt.textColor } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}
                    >
                      {dt ? dt.nr : '—'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {mode === 'apply' && applyTemplate && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <button onClick={() => setMode('list')} className="text-xs text-blue-600 hover:text-blue-500">&larr; Zurück zur Liste</button>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold text-slate-600 mb-1">Vorlage: <span className="text-slate-800">{applyTemplate.name}</span></div>
              <div className="flex gap-1">
                {applyTemplate.days.map((d, i) => {
                  const dt = d !== null ? getDutyType(d) : null;
                  return (
                    <div key={i} className="text-center">
                      <div className="text-[8px] text-slate-400">{DAY_LABELS[i]}</div>
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold"
                        style={dt ? { backgroundColor: dt.color, color: dt.textColor } : { backgroundColor: '#e2e8f0', color: '#94a3b8' }}
                      >
                        {dt ? dt.nr : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Zeitraum</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">bis</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600">Mitarbeiter auswählen</label>
                <div className="flex gap-2">
                  <button onClick={selectAllEmps} className="text-[10px] text-blue-600 hover:text-blue-500">Alle</button>
                  <button onClick={deselectAllEmps} className="text-[10px] text-slate-500 hover:text-slate-400">Keine</button>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg max-h-[35vh] overflow-y-auto divide-y divide-slate-100">
                {activeEmployees.map(emp => (
                  <label
                    key={emp.nr}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                      selectedEmps.has(emp.nr) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmps.has(emp.nr)}
                      onChange={() => toggleEmp(emp.nr)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-xs font-mono text-slate-400">#{emp.nr}</span>
                    <span className="text-xs font-medium text-slate-700">{emp.name} {emp.vorname}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{emp.funktion}</span>
                  </label>
                ))}
              </div>
              {selectedEmps.size > 0 && (
                <div className="text-[10px] text-slate-500 mt-1">{selectedEmps.size} Mitarbeiter ausgewählt</div>
              )}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="border-t border-slate-200 p-4 shrink-0">
          {mode === 'list' && (
            <button
              onClick={handleNewTemplate}
              className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              disabled={!canEdit}
            >
              <Plus className="w-4 h-4" /> Neue Vorlage erstellen
            </button>
          )}
          {mode === 'edit' && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!canEdit}
              >
                <Check className="w-4 h-4" /> Vorlage speichern
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          )}
          {mode === 'apply' && (
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!canEdit}
              >
                <CalendarRange className="w-4 h-4" /> Vorlage anwenden
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
