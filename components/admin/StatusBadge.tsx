import { STATUS_LABELS, STATUS_STYLES } from "@/lib/admin/labels";
import type { SubmissionStatus } from "@/lib/db/schema";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS_STYLES[status])}>{STATUS_LABELS[status]}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-heading text-2xl font-black text-cye-blue">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }).format(d);
