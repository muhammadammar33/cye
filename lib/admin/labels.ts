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

/** Payment verification for competition registrations (empty = not checked yet). */
export const PAYMENT_STATUSES = ["Confirmed", "Unpaid", "Fake"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STYLES: Record<PaymentStatus | "", string> = {
  Confirmed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Unpaid: "border-amber-300 bg-amber-50 text-amber-700",
  Fake: "border-red-300 bg-red-50 text-red-700",
  "": "border-dashed border-slate-300 bg-white text-slate-400",
};
