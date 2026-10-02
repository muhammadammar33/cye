import "server-only";
import { EVENT } from "@/data/event";

type Mail = { to: string | string[]; subject: string; html: string; replyTo?: string };

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
    return `<tr><td style="padding:6px 10px;color:#555;vertical-align:top;white-space:nowrap">${esc(label(key))}</td><td style="padding:6px 10px">${cell}</td></tr>`;
  });
  return `<table style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif">${rows.join("")}</table>`;
}

function layout(title: string, body: string) {
  return `<div style="font:15px/1.6 Arial,sans-serif;color:#1a1a1a;max-width:640px">
  <div style="background:linear-gradient(135deg,#1b4694,#315fac);color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">
    <div style="font-size:12px;letter-spacing:2px;color:#f4782a;font-weight:bold">${esc(EVENT.shortName)}</div>
    <div style="font-size:20px;font-weight:bold">${esc(title)}</div>
  </div>
  <div style="border:1px solid #e5e9f2;border-top:0;padding:20px 22px;border-radius:0 0 12px 12px">${body}</div>
</div>`;
}

export function teamEmail(kind: string, id: number, adminUrl: string, data: Record<string, unknown>) {
  return layout(`New ${kind} (#${id})`, `${dataTable(data)}<p style="margin-top:18px"><a href="${esc(adminUrl)}" style="color:#ef432c;font-weight:bold">Open in the admin dashboard</a></p>`);
}

export function confirmationEmail(name: string, kind: string, summary: string) {
  return layout(
    "We received your submission",
    `<p>Dear ${esc(name)},</p>
<p>Thank you for your ${esc(kind.toLowerCase())} for ${esc(EVENT.name)}${summary ? ` (<strong>${esc(summary)}</strong>)` : ""}. Our team will review it and get back to you soon.</p>
<p><strong>${esc(EVENT.date)}</strong> · ${esc(EVENT.venue)}, ${esc(EVENT.city)}</p>
<p>Regards,<br>Team ${esc(EVENT.name)}</p>`,
  );
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
