import type { HistoryStatusFilter, HistoryTimeFilter } from "../types";

export function HistoryFilters({
  status,
  time,
  hasDates,
  onStatus,
  onTime,
}: {
  status: HistoryStatusFilter;
  time: HistoryTimeFilter;
  hasDates: boolean;
  onStatus: (v: HistoryStatusFilter) => void;
  onTime: (v: HistoryTimeFilter) => void;
}) {
  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
      active
        ? "bg-[#0F3460] text-white shadow-sm"
        : "bg-white text-slate-600 ring-1 ring-slate-200/90"
    }`;

  return (
    <div className="space-y-2 px-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Barchasi"],
            ["completed", "Yakunlangan"],
            ["cancelled", "Bekor qilingan"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={chip(status === key)}
            onClick={() => onStatus(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {hasDates ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Barchasi"],
              ["today", "Bugun"],
              ["week", "Hafta"],
              ["month", "Oy"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={chip(time === key)}
              onClick={() => onTime(key)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
