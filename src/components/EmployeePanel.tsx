import { useState } from 'react';
import { Employee } from '../types';
import { X, UserPlus, Trash2, Edit3, Check, XCircle } from 'lucide-react';

interface EmployeePanelProps {
  employees: Employee[];
  onUpdate: (emp: Employee) => void;
  onAdd: (emp: Employee) => void;
  onRemove: (nr: number) => void;
  onClose: () => void;
}

const FUNKTIONEN = [
  'Applikationsentwicklung',
  'ICT-Fachmann',
  'Plattformentwicklung',
  'Betriebsökonom',
  'Entwickler dig. Business',
  'IPA/VPA Begleiter/Dozent',
];

const STANDORTE = ['Zürich Altstetten', 'St.Gallen', 'Luzern', 'Bern'];
const DUTY_CODES = [1, 5, 10, 14, 15, 16, 17, 18, 19, 20, 30, 40, 41, 45, 50, 51, 52, 60];

export function EmployeePanel({ employees, onUpdate, onAdd, onRemove, onClose }: EmployeePanelProps) {
  const [editingNr, setEditingNr] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Employee>>({
    aktiv: true,
    funktion: FUNKTIONEN[0],
    standort: STANDORTE[0],
  });

  const startEdit = (emp: Employee) => {
    setEditingNr(emp.nr);
    setEditForm({ ...emp, dienstStatistik: { ...(emp.dienstStatistik || {}) } });
  };

  const saveEdit = () => {
    if (editingNr !== null && editForm.name && editForm.vorname) {
      onUpdate(editForm as Employee);
      setEditingNr(null);
      setEditForm({});
    }
  };

  const handleAdd = () => {
    if (!addForm.nr || !addForm.name || !addForm.vorname) {
      alert('Bitte Nr, Name und Vorname ausfüllen.');
      return;
    }
    if (employees.some(e => e.nr === addForm.nr)) {
      alert(`Mitarbeiter-Nr ${addForm.nr} existiert bereits.`);
      return;
    }
    onAdd({
      nr: addForm.nr,
      name: addForm.name,
      vorname: addForm.vorname,
      funktion: addForm.funktion || FUNKTIONEN[0],
      standort: addForm.standort || STANDORTE[0],
      aktiv: addForm.aktiv ?? true,
      email: addForm.email,
      telefon: addForm.telefon,
      pzvKd: addForm.pzvKd,
      totalZuweisungen: addForm.totalZuweisungen,
      ferienguthaben: addForm.ferienguthaben,
      restferien: addForm.restferien,
      krankInProzent: addForm.krankInProzent,
      support: addForm.support as Employee['support'],
      supportAktiv: addForm.supportAktiv as Employee['supportAktiv'],
      ferien2026: addForm.ferien2026,
      dienstStatistik: addForm.dienstStatistik,
    });
    setAddForm({ aktiv: true, funktion: FUNKTIONEN[0], standort: STANDORTE[0] });
    setShowAdd(false);
  };

  const updateDutyCount = (code: number, value: string) => {
    const parsed = value === '' ? undefined : Number(value);
    setEditForm(prev => {
      const stats = { ...(prev.dienstStatistik || {}) };
      if (parsed === undefined || Number.isNaN(parsed)) {
        delete stats[String(code)];
      } else {
        stats[String(code)] = parsed;
      }
      return { ...prev, dienstStatistik: stats };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full sm:w-[500px] bg-white shadow-2xl h-full overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold">Mitarbeiterverwaltung</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {employees.map(emp => (
            <div key={emp.nr} className={`rounded-lg border p-3 ${emp.aktiv ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50/50'}`}>
              {editingNr === emp.nr ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.name || ''}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Name"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={editForm.vorname || ''}
                      onChange={e => setEditForm(f => ({ ...f, vorname: e.target.value }))}
                      placeholder="Vorname"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={editForm.funktion || ''}
                      onChange={e => setEditForm(f => ({ ...f, funktion: e.target.value }))}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FUNKTIONEN.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                    </select>
                    <select
                      value={editForm.standort || ''}
                      onChange={e => setEditForm(f => ({ ...f, standort: e.target.value }))}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STANDORTE.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.email || ''}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="E-Mail"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={editForm.telefon || ''}
                      onChange={e => setEditForm(f => ({ ...f, telefon: e.target.value }))}
                      placeholder="Telefon"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.pzvKd || ''}
                      onChange={e => setEditForm(f => ({ ...f, pzvKd: e.target.value }))}
                      placeholder="100 PZV / 101 KD"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={editForm.totalZuweisungen ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, totalZuweisungen: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Total Zuweisungen"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editForm.ferienguthaben ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, ferienguthaben: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Ferienguthaben lfd. Jahr"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={editForm.restferien ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, restferien: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Restferien"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.krankInProzent ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, krankInProzent: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Krank in %"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editForm.support || ''}
                      onChange={e => setEditForm(f => ({ ...f, support: e.target.value as Employee['support'] }))}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Support</option>
                      <option value="X">X</option>
                      <option value="N">N</option>
                    </select>
                    <select
                      value={editForm.supportAktiv || ''}
                      onChange={e => setEditForm(f => ({ ...f, supportAktiv: e.target.value as Employee['supportAktiv'] }))}
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aktiv</option>
                      <option value="X">X</option>
                      <option value="N">N</option>
                    </select>
                    <input
                      type="number"
                      value={editForm.ferien2026 ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, ferien2026: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Ferien 2026"
                      className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50">
                    <div className="text-[11px] font-semibold text-slate-600 mb-2">Dienste (Anzahl)</div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                      {DUTY_CODES.map(code => (
                        <label key={code} className="text-[11px] text-slate-600">
                          <span className="block mb-0.5">{code}</span>
                          <input
                            type="number"
                            value={editForm.dienstStatistik?.[String(code)] ?? ''}
                            onChange={e => updateDutyCount(code, e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.aktiv ?? true}
                      onChange={e => setEditForm(f => ({ ...f, aktiv: e.target.checked }))}
                      className="rounded border-slate-300"
                    />
                    Aktiv
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-500">
                      <Check className="w-3.5 h-3.5" /> Speichern
                    </button>
                    <button onClick={() => setEditingNr(null)} className="flex items-center gap-1 text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300">
                      <XCircle className="w-3.5 h-3.5" /> Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{emp.nr}</span>
                      <span className="text-sm font-semibold text-slate-800">{emp.name} {emp.vorname}</span>
                      {!emp.aktiv && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Inaktiv</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {emp.funktion} · {emp.standort}
                    </div>
                    {(emp.totalZuweisungen !== undefined || emp.ferienguthaben !== undefined || emp.restferien !== undefined || emp.ferien2026 !== undefined) && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        Total: {emp.totalZuweisungen ?? '-'} · Ferien: {emp.ferienguthaben ?? '-'} · Rest: {emp.restferien ?? '-'} · Ferien 2026: {emp.ferien2026 ?? '-'}
                      </div>
                    )}
                    {(emp.krankInProzent !== undefined || emp.support || emp.supportAktiv) && (
                      <div className="text-[10px] text-slate-500">
                        Krank in %: {emp.krankInProzent ?? '-'} · Support: {emp.support || '-'} · Aktiv: {emp.supportAktiv || '-'}
                      </div>
                    )}
                    {emp.email && <div className="text-[10px] text-slate-400 mt-0.5">{emp.email}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(emp)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${emp.name} ${emp.vorname} wirklich entfernen?`)) {
                          onRemove(emp.nr);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-4">
          {showAdd ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-700">Neuer Mitarbeiter</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={addForm.nr || ''}
                  onChange={e => setAddForm(f => ({ ...f, nr: Number(e.target.value) }))}
                  placeholder="Nr"
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={addForm.name || ''}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Name"
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={addForm.vorname || ''}
                  onChange={e => setAddForm(f => ({ ...f, vorname: e.target.value }))}
                  placeholder="Vorname"
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={addForm.funktion || ''}
                  onChange={e => setAddForm(f => ({ ...f, funktion: e.target.value }))}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FUNKTIONEN.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                </select>
                <select
                  value={addForm.standort || ''}
                  onChange={e => setAddForm(f => ({ ...f, standort: e.target.value }))}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STANDORTE.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                  <UserPlus className="w-3.5 h-3.5" /> Hinzufügen
                </button>
                <button onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300">
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
              <UserPlus className="w-4 h-4" /> Mitarbeiter hinzufügen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
