import { Lock } from "lucide-react";
import { EVENT } from "@/data/event";

export function ClosedNotice({ what, email }: { what: string; email: string }) {
  return (
    <div className="rounded-2xl bg-cye-mist p-6 text-center" role="status">
      <Lock className="mx-auto h-6 w-6 text-cye-orange" aria-hidden />
      <p className="mt-3 font-heading text-lg font-extrabold text-cye-blue">{what} is closed</p>
      <p className="mt-2 text-sm text-cye-ink/65">
        Thank you for your interest in {EVENT.shortName}. For late requests, write to{" "}
        <a href={`mailto:${email}`} className="font-semibold text-cye-orange hover:text-cye-orange-lt">
          {email}
        </a>
        .
      </p>
    </div>
  );
}
