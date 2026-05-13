import { Loader } from "../../../shared/ui/Loader";

export function HistorySkeleton() {
  return (
    <Loader
      variant="section"
      className="min-h-[45vh] border-0 bg-transparent shadow-none"
      label="Tarix yuklanmoqda…"
    />
  );
}
