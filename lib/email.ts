import "server-only";
import { AUDIENCE, EVENT, VERTICALS } from "@/data/event";
import type { SubmissionType } from "@/lib/db/schema";
import type { PaymentSettings } from "@/lib/defaults";
import { whatsappLink } from "@/lib/phone";
import { PASS_CATEGORIES, type PassCategory } from "@/lib/passCategories";

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
    } else if (typeof value === "string" && /^https:\/\//.test(value)) {
      cell = `<a href="${esc(value)}" style="color:${ORANGE};font-weight:bold;word-break:break-all">${key === "paymentSlip" ? "View payment slip" : key === "resultCard" ? "View result card" : esc(value)}</a>`;
    } else {
      cell = esc(value).replace(/\n/g, "<br>");
    }
    return `<tr><td style="padding:8px 12px 8px 0;color:#6b7280;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eef1f6">${esc(label(key))}</td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;color:#1a1a1a">${cell}</td></tr>`;
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font:14px/1.5 ${FONT}">${rows.join("")}</table>`;
}

function button(href: string, text: string, color = ORANGE) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${color};${color === ORANGE ? `background-image:linear-gradient(90deg,${ORANGE},${ORANGE_LT});` : ""}color:#ffffff;font:bold 14px ${FONT};text-decoration:none;padding:12px 22px;border-radius:999px;margin:4px 6px 4px 0">${esc(text)}</a>`;
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

function layout(ctx: EmailContext, opts: { preheader: string; eyebrow: string; title: string; body: string; marketing?: boolean; logoWidth?: number }) {
  const { origin } = ctx;
  const logo = opts.logoWidth ?? 120;
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
    <a href="${esc(origin)}"><img src="${esc(origin)}/brand/email-logo.png" width="${logo}" alt="Capital Youth Expo" style="display:block;width:${logo}px;height:auto;border:0"></a>
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
  competition: "Our competitions team will verify your registration and payment. Once approved, every team member receives their own event pass by email, and we share the guidelines and schedule with your team lead.",
  project: "Our judges will review your project. Shortlisted teams receive their event pass by email, with exhibition space details for expo day.",
  startup: "Our VentureX team will review your pitch. Shortlisted startups receive their event pass by email and an invitation to investor networking and mentorship sessions.",
  visitor: "Our team will confirm your registration and email your visitor pass with a QR code. Bring it with a valid student or national ID on expo day.",
  ambassador: "Our ambassador team will review your application and contact you for a short call. Selected ambassadors receive their event pass by email.",
  volunteer: "Our team will review your application. Selected volunteers receive their event pass by email and an invitation to a short briefing before expo day.",
  sponsor: "Our partnerships team will contact you shortly with the sponsorship deck and to discuss the package that suits you best.",
  contact: "Our team will get back to you as soon as possible, usually within two working days.",
  talent: "Our team will verify your result card. Students who qualify receive their Talent Tribute pass by email, with details of the ceremony at the expo.",
};

export function teamEmail(ctx: EmailContext, kind: string, id: number, adminUrl: string, data: Record<string, unknown>) {
  const slip = typeof data.paymentSlip === "string" ? data.paymentSlip : "";
  const slipBlock = slip
    ? `<p style="margin:20px 0 8px;font-weight:bold;color:${BLUE}">Payment slip</p><a href="${esc(slip)}"><img src="${esc(slip)}" width="260" alt="Payment slip" style="display:block;width:260px;max-width:100%;height:auto;border:1px solid #e5e9f2;border-radius:10px"></a>`
    : "";
  return layout(ctx, {
    preheader: `New ${kind} #${id}`,
    eyebrow: "ADMIN NOTIFICATION",
    title: `New ${kind}`,
    body: `<p style="margin:0 0 16px;color:#6b7280">Submission #${id} just came in through the website.</p>${dataTable(data)}${slipBlock}
<p style="margin:24px 0 0;text-align:center">${button(adminUrl, "Open in the admin dashboard")}</p>`,
  });
}

type PaymentInfo = { payment: PaymentSettings; fee: string; slipReceived: boolean };

function paymentBlock(info: PaymentInfo) {
  if (info.slipReceived) {
    return `<p style="margin:0 0 12px">We have received your <strong>payment slip</strong>${info.fee ? ` for <strong>${esc(info.fee)}</strong>` : ""}. Our team will verify it and confirm your registration.</p>`;
  }
  if (!info.payment.accounts.length) return "";
  const rows = info.payment.accounts
    .map(
      (a) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eef1f6;font:14px ${FONT}"><strong style="color:${BLUE}">${esc(a.method)}</strong>${a.title ? `<br><span style="color:#6b7280;font-size:12px">${esc(a.title)}</span>` : ""}</td><td style="padding:8px 12px;border-bottom:1px solid #eef1f6;font:bold 14px monospace;color:#1a1a1a">${a.number.split(/\s*[/|,]\s*/).filter(Boolean).map((n) => esc(n)).join("<br>")}</td></tr>`,
    )
    .join("");
  return `<p style="margin:0 0 8px;font-weight:bold;color:${BLUE}">Payment details${info.fee ? `: ${esc(info.fee)}` : ""}</p>
<p style="margin:0 0 8px;font-size:14px;color:#374151">${esc(info.payment.instructions)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 12px;background:#f5f7fb;border-radius:8px">${rows}</table>
<p style="margin:0 0 12px;font-size:14px;color:#374151">After paying, reply to this email with a photo of your payment slip.</p>`;
}

type FocalInfo = { name: string; phone: string | null; topic: string };

function focalBlock(f: FocalInfo) {
  const phone = f.phone ? ` on <a href="${esc(whatsappLink(f.phone))}" style="color:${ORANGE};font-weight:bold;text-decoration:none;white-space:nowrap">${esc(f.phone)}</a>` : "";
  return `<p style="margin:0 0 12px">For questions about ${esc(f.topic)}, contact the focal person <strong>${esc(f.name)}</strong>${phone}.</p>`;
}

export function confirmationEmail(ctx: EmailContext, type: SubmissionType, name: string, kind: string, summary: string, payment?: PaymentInfo, focal?: FocalInfo) {
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
${payment ? paymentBlock(payment) : ""}
${focal ? focalBlock(focal) : ""}
<p style="margin:0 0 4px">${focal ? "You can also reply to this email." : "Questions? Simply reply to this email."}</p>
<p style="margin:16px 0 0">Regards,<br><strong>Team ${esc(EVENT.name)}</strong></p>`,
  });
}

type PassForEmail = { token: string; code: string | null; category: string; name: string; detail: string | null; institution: string | null; createdAt?: Date };

const ISSUED = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });

/**
 * The event pass, styled like the printable pass page: a ribbon in the pass type's colour, labelled fields,
 * a modest QR code and the venue along the bottom. Built from tables and hosted images so email apps show it.
 */
export function passEmail(ctx: EmailContext, pass: PassForEmail) {
  const cat = PASS_CATEGORIES[pass.category as PassCategory] ?? PASS_CATEGORIES.visitor;
  const link = `${ctx.origin}/pass/${pass.token}`;
  const qr = `${ctx.origin}/api/passes/${pass.token}/qr`;
  const diamonds = (c: string) =>
    ["#ef432c", c, "#f4782a"].map((d) => `<span style="display:inline-block;width:7px;height:7px;background:${d};transform:rotate(45deg);margin:0 2px"></span>`).join("");
  const field = (label: string, value: string, color = "#111827") =>
    `<p style="margin:0 0 2px;font:bold 10px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:#6b7280">${esc(label)}</p>
     <p style="margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #d6dbe4;font:bold 16px ${FONT};color:${color}">${esc(value)}</p>`;
  const fields = [
    field("Name", pass.name),
    pass.detail ? field(pass.category === "competition" ? "Competition" : "Role / for", pass.detail) : "",
    pass.institution ? field("Institution", pass.institution) : "",
    field("Pass type", cat.label, cat.color),
  ].join("");
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:#fffdf8;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;border-collapse:separate">
  <tr><td style="padding:16px 16px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cat.color};border-radius:12px"><tr><td align="center" style="padding:12px 10px;font-family:${FONT};color:#ffffff">
      <p style="margin:0;font-size:19px;font-weight:bold;letter-spacing:1px;white-space:nowrap">${diamonds("#ffffff")}&nbsp; OFFICIAL ENTRY PASS &nbsp;${diamonds("#ffffff")}</p>
      <p style="margin:4px 0 0;font-size:11px;font-weight:bold;letter-spacing:3px;opacity:.9">${esc(cat.label.toUpperCase())}</p>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:18px 24px 4px">${fields}</td></tr>
  <tr><td align="center" style="padding:4px 20px 0;font-family:${FONT}">
    <img src="${esc(qr)}" width="140" height="140" alt="QR code for pass ${esc(pass.code ?? "")}" style="display:block;width:140px;height:140px;margin:0 auto;border:6px solid #ffffff;border-radius:10px">
    <p style="margin:8px 0 0;font:bold 16px monospace;letter-spacing:3px;color:${cat.color}">${esc(pass.code ?? "")}</p>
    <p style="margin:6px 0 0">${diamonds(cat.color)}</p>
    ${pass.createdAt ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280">Issued ${esc(ISSUED.format(pass.createdAt))}</p>` : ""}
    <p style="margin:12px 0 0;font-size:13px;color:#1b4694"><strong>${esc(EVENT.date)}</strong> · ${esc(EVENT.venue)}, ${esc(EVENT.city)}</p>
    <p style="margin:8px 0 10px;font-size:12px;font-weight:bold;color:#1b4694">Original CNIC, student card or B-Form required for entry</p>
  </td></tr>
  <tr><td style="padding:0;line-height:0"><img src="${esc(ctx.origin)}/brand/email-pass-venue.jpg" width="600" alt="${esc(EVENT.venue)}, ${esc(EVENT.city)}" style="display:block;width:100%;height:auto;border:0"></td></tr>
</table>`;
  return layout(ctx, {
    preheader: `Your ${cat.label} pass for Capital Youth Expo 2026, ${EVENT.date}.`,
    eyebrow: "YOUR EVENT PASS",
    title: "You're in! Here is your pass",
    logoWidth: 170,
    body: `<p style="margin:0 0 12px">Dear ${esc(pass.name)},</p>
<p style="margin:0 0 12px">Your place at <strong>${esc(EVENT.name)}</strong> is confirmed. This is your personal entry pass.</p>
${card}
<p style="margin:0 0 8px"><strong style="color:${BLUE}">At the entrance</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#374151">
  <li style="margin-bottom:4px">Show the QR code on your phone, or a printout of this pass.</li>
  <li style="margin-bottom:4px">Bring your CNIC, student card or B-Form.</li>
  <li>This pass is for you only and can't be shared.</li>
</ul>
<p style="margin:0 0 16px;text-align:center">${button(link, "Open my pass", cat.color)}</p>
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">If the QR code doesn't show, open the pass with the button above. You can print it or save it as a PDF from there.</p>
<p style="margin:16px 0 0">See you there,<br><strong>Team ${esc(EVENT.name)}</strong></p>`,
  });
}

/** Sends up to 100 emails in one Resend call. Same rules as sendEmail: never throws, false when not sent. */
export async function sendEmailBatch(mails: Mail[]): Promise<boolean> {
  if (!mails.length) return true;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email] RESEND_API_KEY not set, skipped ${mails.length} email(s): ${mails.map((m) => `"${m.subject}" to ${m.to}`).join("; ")}`);
    return false;
  }
  const from = process.env.EMAIL_FROM || "Capital Youth Expo <noreply@capitalyouthexpo.com>";
  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(mails.map((m) => ({ from, to: m.to, subject: m.subject, html: m.html, reply_to: m.replyTo }))),
    });
    if (!res.ok) console.error(`[email] Resend batch ${res.status}: ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.error("[email] batch send failed", err);
    return false;
  }
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
