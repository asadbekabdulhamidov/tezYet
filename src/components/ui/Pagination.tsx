import { Button } from "./Button";

export function Pagination({
  count,
  page,
  hasNext,
  hasPrevious,
  isLoading,
  onNext,
  onPrevious,
}: {
  count: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading?: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <div>
        Jami: <strong>{count}</strong> | Sahifa: <strong>{page}</strong>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="px-3 py-2 text-xs"
          disabled={!hasPrevious || isLoading}
          onClick={onPrevious}
        >
          Oldingi
        </Button>
        <Button
          variant="outline"
          className="px-3 py-2 text-xs"
          disabled={!hasNext || isLoading}
          onClick={onNext}
        >
          Keyingi
        </Button>
      </div>
    </div>
  );
}
