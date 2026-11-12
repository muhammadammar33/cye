import QRCode from "qrcode";
import { passByToken, passOrigin } from "@/lib/passes";

/** PNG QR code that opens the pass page. Used in the pass email and on the pass page. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pass = await passByToken(token);
  if (!pass) return new Response("Not found", { status: 404 });
  const png = await QRCode.toBuffer(`${await passOrigin()}/pass/${pass.token}`, { width: 360, margin: 1, errorCorrectionLevel: "M", color: { dark: "#111827", light: "#ffffff" } });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "X-Robots-Tag": "noindex" },
  });
}
