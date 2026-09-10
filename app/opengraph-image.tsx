import { ImageResponse } from "next/og";

export const alt = "Capital Youth Expo 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(circle at 100% 0%, rgba(255,90,31,0.28), transparent 42%), radial-gradient(circle at 0% 100%, rgba(11,77,162,0.35), transparent 40%), #073A7A",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#FF7A45", fontWeight: 700 }}>
          ENGAGE · ENCOURAGE · EMPOWER
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 18, lineHeight: 1.05 }}>
          Capital Youth Expo 2026
        </div>
        <div style={{ fontSize: 28, marginTop: 22, color: "rgba(255,255,255,0.88)" }}>
          18 November 2026 · Pak-China Friendship Center, Islamabad
        </div>
      </div>
    ),
    { ...size },
  );
}
