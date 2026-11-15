import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { preEventEmail } from "@/lib/email";
import { passOrigin } from "@/lib/passes";

/** Preview of the pre-event result emails with example details, so the wording can be checked before sending. */
export async function GET(req: Request) {
  await requireAdmin();
  const variant = new URL(req.url).searchParams.get("variant") ?? "not_qualified";
  const settings = await getSettings();
  const html = preEventEmail(
    { origin: await passOrigin(), social: settings.social_links },
    {
      name: "Ali Khan",
      competition: "Robo War",
      reason: variant.startsWith("absent") ? "absent" : "not_qualified",
      apology: variant.endsWith("apology"),
      pass: { token: "0".repeat(32), code: "CYE-V-00000", category: "visitor", name: "Ali Khan", detail: "Visitor · Robo War pre-event", institution: "NUST", createdAt: new Date() },
    },
  );
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
