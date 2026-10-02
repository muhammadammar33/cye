import "server-only";
import { AUDIENCE, EVENT, VERTICALS } from "@/data/event";
import type { SubmissionType } from "@/lib/db/schema";

type Mail = { to: string | string[]; subject: string; html: string; replyTo?: string };

/** Absolute site origin for links and images in emails (the request origin, so previews work too). */
export type EmailContext = { origin: string; social: Record<string, string> };

const ORANGE = "#ef432c";
const ORANGE_LT = "#f4782a";
const BLUE = "#1b4694";
const BLUE_LT = "#315fac";
const FONT = "Arial,Helvetica,sans-serif";

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const label = (key: string) => key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());

/** Renders submission data (including nested team members) as an HTML table. */
export function dataTable(data: Record<string, unknown>): string {
  const rows = Object.entries(data).map(([key, value]) => {
    let cell: string;
    if (Array.isArray(value)) {
      cell = value
        .map((item, i) =>
          typeof item === "object" && item
            ? `<div style="margin-bottom:6px"><strong>#${i + 1}</strong> ${Object.entries(item).map(([k, v]) => `${esc(label(k))}: ${esc(v)}`).join(" · ")}</div>`
            : esc(item),
        )
        .join("");
    } else {
      cell = esc(value).replace(/\n/g, "<br>");
    }
    return `<tr><td style="padding:8px 12px 8px 0;color:#6b7280;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eef1f6">${esc(label(key))}</td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;color:#1a1a1a">${cell}</td></tr>`;
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font:14px/1.5 ${FONT}">${rows.join("")}</table>`;
}

function button(href: string, text: string, color = ORANGE) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${color};background-image:linear-gradient(90deg,${ORANGE},${ORANGE_LT});color:#ffffff;font:bold 14px ${FONT};text-decoration:none;padding:12px 22px;border-radius:999px;margin:4px 6px 4px 0">${esc(text)}</a>`;
}

function outlineButton(href: string, text: string) {
  return `<a href="${esc(href)}" style="display:inline-block;color:${BLUE};font:bold 14px ${FONT};text-decoration:none;padding:10px 20px;border:2px solid ${BLUE};border-radius:999px;margin:4px 6px 4px 0">${esc(text)}</a>`;
}

/** Real profile links only (skips placeholder homepages such as https://instagram.com). */
function socialLinks(social: Record<string, string>) {
  const names: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube" };
  const links = Object.entries(social)
    .filter(([, url]) => {
      try {
        return new URL(url).pathname.replace(/\/$/, "").length > 0;
      } catch {
        return false;
      }
    })
    .map(([key, url]) => `<a href="${esc(url)}" style="color:${BLUE};text-decoration:none;font-weight:bold">${esc(names[key] ?? key)}</a>`);
  return links.length ? `<p style="margin:0 0 10px">${links.join(' &nbsp;·&nbsp; ')}</p>` : "";
}

function layout(ctx: EmailContext, opts: { preheader: string; eyebrow: string; title: string; body: string; marketing?: boolean }) {
  const { origin } = ctx;
  const stats = [
    { value: "40,000+", label: "Attendees" },
    { value: AUDIENCE[1]?.value ?? "700+", label: "Institutions" },
    { value: String(VERTICALS.length), label: "Verticals" },
  ];
  const marketing = opts.marketing
    ? `
  <tr><td style="padding:0 32px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLUE};background-image:linear-gradient(135deg,${BLUE},${BLUE_LT});border-radius:16px">
      <tr><td style="padding:24px 24px 8px;text-align:center;color:#ffffff;font-family:${FONT}">
        <p style="margin:0;font-size:11px;letter-spacing:3px;font-weight:bold;color:${ORANGE_LT}">${esc(EVENT.tagline)}</p>
        <p style="margin:8px 0 0;font-size:22px;font-weight:bold">The stage is set for ${esc(EVENT.shortName)}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#dbe4f5">${esc(EVENT.date)} · ${esc(EVENT.venue)}, ${esc(EVENT.city)}</p>
      </td></tr>
      <tr><td style="padding:12px 16px 20px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${stats
            .map(
              (s) =>
                `<td width="33%" style="text-align:center;font-family:${FONT};color:#ffffff;padding:8px 4px"><div style="font-size:22px;font-weight:bold">${esc(s.value)}</div><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#c9d6ef">${esc(s.label)}</div></td>`,
            )
            .join("")}
        </tr></table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 32px 4px;font-family:${FONT};color:#374151;font-size:14px;line-height:1.6">
    <p style="margin:0 0 6px;font-weight:bold;color:${BLUE}">Five verticals, one expo</p>
    <p style="margin:0">${VERTICALS.map((v) => `<strong>${esc(v.name)}</strong> <span style="color:#6b7280">(${esc(v.subtitle)})</span>`).join("<br>")}</p>
  </td></tr>
  <tr><td style="padding:16px 32px 8px">
    ${button(`${origin}/competitions`, "Explore competitions")}${outlineButton(`${origin}/#sponsorship`, "Partner with us")}
  </td></tr>`
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f1f4f9">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4f9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
  <tr><td style="height:6px;background:${ORANGE};background-image:linear-gradient(90deg,${ORANGE},${ORANGE_LT},${BLUE_LT},${BLUE})"></td></tr>
  <tr><td align="center" style="padding:28px 32px 8px">
    <a href="${esc(origin)}"><img src="${esc(origin)}/brand/email-logo.png" width="120" alt="Capital Youth Expo" style="display:block;width:120px;height:auto;border:0"></a>
  </td></tr>
  <tr><td style="padding:8px 32px 0;text-align:center;font-family:${FONT}">
    <p style="margin:0;font-size:11px;letter-spacing:3px;font-weight:bold;color:${ORANGE}">${esc(opts.eyebrow)}</p>
    <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:${BLUE}">${esc(opts.title)}</h1>
  </td></tr>
  <tr><td style="padding:20px 32px 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:#1a1a1a">${opts.body}</td></tr>
  ${marketing}
  <tr><td style="padding:20px 32px 28px;text-align:center;font-family:${FONT};font-size:12px;line-height:1.6;color:#6b7280;border-top:1px solid #eef1f6">
    ${socialLinks(ctx.social)}
    <p style="margin:0">Organized by ${esc(EVENT.organizers.join(" in collaboration with "))}</p>
    <p style="margin:10px 0 0"><span style="letter-spacing:2px;font-size:10px;text-transform:uppercase">Powered by</span><br>
      <img src="${esc(origin)}/brand/email-youth-insight.png" width="100" alt="${esc(EVENT.poweredBy)}" style="display:inline-block;width:100px;height:auto;border:0;margin-top:4px"></p>
    <p style="margin:10px 0 0"><a href="${esc(origin)}" style="color:${ORANGE};text-decoration:none;font-weight:bold">${esc(EVENT.website)}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** What happens next, per form, for the applicant's confirmation. */
const NEXT_STEPS: Record<SubmissionType, string> = {
  competition: "Our competitions team will review your registration and share fee payment details and the competition guidelines with your team lead.",
  project: "Our judges will review your project. Shortlisted teams will be contacted with exhibition space details for expo day.",
  startup: "Our VentureX team will review your pitch. Shortlisted startups will be invited for investor networking and mentorship sessions.",
  visitor: "Your visitor registration is confirmed. Keep this email handy and bring a valid student or national ID on expo day.",
  ambassador: "Our ambassador team will review your application and contact you for a short call about representing CYE at your campus.",
  volunteer: "Our team will review your application and invite you to a short briefing before expo day.",
  sponsor: "Our partnerships team will contact you shortly with the sponsorship deck and to discuss the package that suits you best.",
  contact: "Our team will get back to you as soon as possible, usually within two working days.",
};

export function teamEmail(ctx: EmailContext, kind: string, id: number, adminUrl: string, data: Record<string, unknown>) {
  return layout(ctx, {
    preheader: `New ${kind} #${id}`,
    eyebrow: "ADMIN NOTIFICATION",
    title: `New ${kind}`,
    body: `<p style="margin:0 0 16px;color:#6b7280">Submission #${id} just came in through the website.</p>${dataTable(data)}
<p style="margin:24px 0 0;text-align:center">${button(adminUrl, "Open in the admin dashboard")}</p>`,
  });
}

export function confirmationEmail(ctx: EmailContext, type: SubmissionType, name: string, kind: string, summary: string) {
  return layout(ctx, {
    preheader: `Thank you, ${name}. We received your ${kind.toLowerCase()}.`,
    eyebrow: "SUBMISSION RECEIVED",
    title: "Thank you for joining CYE 2026!",
    marketing: true,
    body: `<p style="margin:0 0 12px">Dear ${esc(name)},</p>
<p style="margin:0 0 12px">We have received your <strong>${esc(kind.toLowerCase())}</strong>${summary ? ` for <strong>${esc(summary)}</strong>` : ""}.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f5f7fb;border-left:4px solid ${ORANGE};border-radius:8px">
  <tr><td style="padding:14px 16px;font:14px/1.6 ${FONT};color:#374151"><strong style="color:${BLUE}">What happens next</strong><br>${esc(NEXT_STEPS[type])}</td></tr>
</table>
<p style="margin:0 0 4px">Questions? Simply reply to this email.</p>
<p style="margin:16px 0 0">Regards,<br><strong>Team ${esc(EVENT.name)}</strong></p>`,
  });
}

/** Sends through Resend when RESEND_API_KEY is set; otherwise logs and skips. Never throws. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email] RESEND_API_KEY not set, skipped "${mail.subject}" to ${mail.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Capital Youth Expo <noreply@capitalyouthexpo.com>",
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        reply_to: mail.replyTo,
      }),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status}: ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}
