import type { SubmissionStatus, SubmissionType } from "@/lib/db/schema";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  in_review: "In review",
  contacted: "Contacted",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  in_review: "bg-blue-100 text-blue-700",
  contacted: "bg-violet-100 text-violet-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-200 text-slate-600",
};

export const TYPE_NAMES: Record<SubmissionType, string> = {
  competition: "Competitions",
  project: "Projects",
  startup: "Startups",
  visitor: "Visitors",
  ambassador: "Ambassadors",
  volunteer: "Volunteers",
  sponsor: "Sponsors & stalls",
  contact: "Contact messages",
};
