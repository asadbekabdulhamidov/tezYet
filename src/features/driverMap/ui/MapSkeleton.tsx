import { Skeleton } from "../../../shared/ui/Skeleton";

export function MapSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-4.25rem)] flex-col bg-slate-100 pb-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mx-4 mt-3 min-h-[45vh] flex-1 rounded-2xl" />
      <div className="mx-4 mt-4 space-y-2 pb-28">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 flex flex-col gap-2">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}
