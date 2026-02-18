import { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react';
import { dutyTypes } from '../data/dutyTypes';
import { X, Eraser } from 'lucide-react';

interface DutySelectorProps {
  x: number;
  y: number;
  currentDuty: number | null;
  onSelect: (dutyNr: number | null) => void;
  onClose: () => void;
  employeeName: string;
  dateLabel: string;
}

export function DutySelector({ x, y, currentDuty, onSelect, onClose, employeeName, dateLabel }: DutySelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const [ready, setReady] = useState(false);
  const mountTime = useRef(Date.now());

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    let left = x;
    let top = y;

    if (left + rect.width > vw - pad) {
      left = Math.max(pad, x - rect.width);
    }
    if (top + rect.height > vh - pad) {
      top = Math.max(pad, y - rect.height);
    }

    setPos({ left, top });
    setReady(true);
  }, [x, y]);

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (Date.now() - mountTime.current < 200) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        stableClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') stableClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [stableClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-opacity duration-100"
      style={{
        left: pos.left,
        top: pos.top,
        minWidth: 280,
        maxHeight: '80vh',
        opacity: ready ? 1 : 0,
      }}
    >
      <div className="bg-slate-50 px-3 py-2 border-b flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-700">{employeeName}</div>
          <div className="text-xs text-slate-500">{dateLabel}</div>
        </div>
        <button onClick={stableClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="p-2 overflow-y-auto max-h-[60vh] grid grid-cols-2 gap-1">
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors text-left"
        >
          <Eraser className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-600 font-medium">Löschen</span>
        </button>

        {dutyTypes.map(dt => (
          <button
            key={dt.nr}
            onClick={() => onSelect(dt.nr)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left border ${
              currentDuty === dt.nr
                ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50'
                : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: dt.color, color: dt.textColor }}
            >
              {dt.nr}
            </span>
            <span className="text-slate-700 truncate">{dt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
