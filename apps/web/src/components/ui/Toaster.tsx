import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/utils";

const icons = {
  info: <Info className="h-5 w-5 text-brand-500" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

export function Toaster() {
  const { toasts, dismissToast } = useUi();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-white p-3 shadow-lg dark:bg-graphite-900",
            "border-graphite-200 dark:border-graphite-800 animate-in",
          )}
        >
          {icons[t.kind]}
          <p className="flex-1 text-sm text-graphite-700 dark:text-graphite-200">{t.message}</p>
          <button aria-label="Chiudi" onClick={() => dismissToast(t.id)}>
            <X className="h-4 w-4 text-graphite-400 hover:text-graphite-600" />
          </button>
        </div>
      ))}
    </div>
  );
}
