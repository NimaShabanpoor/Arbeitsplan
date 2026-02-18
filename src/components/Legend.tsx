import { dutyTypes } from '../data/dutyTypes';

export function Legend() {
  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Legende</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {dutyTypes.map(dt => (
          <div
            key={dt.nr}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100"
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ backgroundColor: dt.color, color: dt.textColor }}
            >
              {dt.nr}
            </span>
            <span className="text-[11px] text-slate-600 whitespace-nowrap">
              {dt.name}
              <span className="text-slate-400 ml-1">({dt.startTime}-{dt.endTime})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
