import {
  forwardRef,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary:
    "bg-graphite-100 text-graphite-800 hover:bg-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:hover:bg-graphite-700",
  ghost:
    "text-graphite-600 hover:bg-graphite-100 dark:text-graphite-300 dark:hover:bg-graphite-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-graphite-200 hover:bg-graphite-50 dark:hover:bg-graphite-800",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function IconButton({
  className,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-graphite-500 hover:bg-graphite-100 hover:text-graphite-800 dark:hover:bg-graphite-800 dark:hover:text-graphite-100 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-graphite-200 bg-white dark:border-graphite-800 dark:bg-graphite-900/60 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-graphite-100 dark:border-graphite-800 px-5 py-3.5">
      <div>
        <h3 className="font-semibold text-graphite-800 dark:text-graphite-100">{title}</h3>
        {subtitle && <p className="text-sm text-graphite-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Inputs ───────────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-graphite-300 bg-white px-3 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-brand-500 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-100 transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-graphite-300 bg-white px-3 py-2 text-sm text-graphite-900 placeholder:text-graphite-400 focus:border-brand-500 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-100 transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-graphite-300 bg-white px-3 text-sm text-graphite-900 focus:border-brand-500 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-100 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-graphite-700 dark:text-graphite-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-graphite-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Badges ───────────────────────────────────────────────────────────────────
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  planned: "bg-graphite-100 text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300",
  draft: "bg-graphite-100 text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  archived: "bg-graphite-100 text-graphite-500 dark:bg-graphite-800 dark:text-graphite-400",
  in_stock: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  low: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  out: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};
const statusLabels: Record<string, string> = {
  active: "Attivo",
  running: "In corso",
  completed: "Completato",
  planned: "Pianificato",
  draft: "Bozza",
  paused: "In pausa",
  failed: "Fallito",
  archived: "Archiviato",
  in_stock: "Disponibile",
  low: "Scorta bassa",
  out: "Esaurito",
  expired: "Scaduto",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColors[status] ?? statusColors.draft}>
      {statusLabels[status] ?? status}
    </Badge>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose(): void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={cn(
          "w-full rounded-xl border border-graphite-200 bg-white shadow-2xl dark:border-graphite-800 dark:bg-graphite-900",
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-graphite-100 dark:border-graphite-800 px-5 py-3.5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton label="Chiudi" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-graphite-100 dark:border-graphite-800 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── States ───────────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-graphite-300 dark:border-graphite-700 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-graphite-400">{icon}</div>}
      <h3 className="font-semibold text-graphite-700 dark:text-graphite-200">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-graphite-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-graphite-200 dark:bg-graphite-800", className)} />;
}

export function LoadingState({ label = "Caricamento…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-graphite-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-graphite-300 border-t-brand-500" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?(): void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 p-6 text-center">
      <p className="text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Riprova
        </Button>
      )}
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange(id: string): void;
}) {
  return (
    <div className="flex gap-1 border-b border-graphite-200 dark:border-graphite-800" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === t.id
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-graphite-500 hover:text-graphite-800 dark:hover:text-graphite-200",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
