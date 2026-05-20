import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";

export function AdminLoading({ label = "Ma’lumotlar yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white py-12">
      <Spinner label={label} />
    </div>
  );
}

export function AdminError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert tone="danger">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {onRetry ? (
          <Button variant="outline" className="border-red-200 px-3 py-2 text-xs" onClick={onRetry}>
            Qayta urinish
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}

export function AdminEmpty({
  title = "Ma’lumot yo‘q",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
      <div className="text-sm font-bold text-slate-800">{title}</div>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
