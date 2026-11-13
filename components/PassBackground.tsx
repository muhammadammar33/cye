import type { ReactNode } from "react";
import { Bot, BookOpen, Brush, Clapperboard, CodeXml, Drone, Landmark, Lightbulb, Mic, Palette, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Competition icons, each on a glossy 3D bubble, around the edges of the pass and clear of the text and QR code.
 * Coordinates are in a 420-wide space; y < 430 is measured from the top of the card, larger y from the bottom
 * (the card is ~1000 tall). [icon, x, y, size, rotation, tinted with the pass colour]
 */
const DOODLES: [LucideIcon, number, number, number, number, boolean][] = [
  [Bot, 16, 164, 40, -12, false], // Robo War, Line Following Robot
  [Drone, 348, 176, 42, 10, true], // Drone Race
  [CodeXml, 14, 226, 30, 8, true], // Hackathon, Speed Programming
  [ShieldCheck, 374, 238, 30, -8, false], // Cyber Security
  [Lightbulb, 50, 656, 34, -14, true], // Pitch Your Idea, Business Innovation
  [Mic, 100, 704, 30, 12, false], // Speech, Naat
  [Palette, 34, 762, 36, -6, true], // Arts, Graphic Design
  [Brush, 84, 806, 28, 24, false],
  [Clapperboard, 22, 818, 30, -10, false], // Reel Competition
  [Landmark, 372, 796, 30, -6, false], // Youth Parliament
  [BookOpen, 318, 830, 32, 8, true], // Qirat
];

/**
 * Background art for the entry pass, in SVG so it prints crisply:
 * - warm paper with CYE orange and blue washes, a light geometric star pattern and painted brush swashes;
 * - 3D shapes: glossy spheres, a ring and isometric cubes in CYE colours and the pass colour;
 * - Faisal Mosque, drawn to its real form (tent-shaped prayer hall, four pencil minarets) and shaded in 3D;
 * - competition icons on glossy bubbles, and a few birds.
 * Artwork near the top is laid out from the card's top edge and artwork near the bottom from its bottom edge, so
 * nothing drifts onto the text when a pass has more or fewer fields. `accent` is the pass type's colour.
 */
export function PassBackground({ accent, id }: { accent: string; id: string }) {
  const ink = "#1b4694";
  // A near-black pass colour (Event Team) would look like grey smudges; use CYE orange for its tints instead.
  const tint = accent === "#111827" ? "#f4782a" : accent;
  const u = (name: string) => `url(#${id}-${name})`;

  /** A glossy sphere: base colour, darker rim, white highlight and a soft shadow underneath. */
  const sphere = (cx: number, cy: number, r: number, color: string) => (
    <g key={`s${cx}-${cy}`}>
      <ellipse cx={cx + r * 0.15} cy={cy + r * 1.05} rx={r * 0.85} ry={r * 0.22} fill="#0b1b3a" opacity="0.12" filter={u("soft")} />
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r} fill={u("rim")} />
      <circle cx={cx} cy={cy} r={r} fill={u("shine")} />
    </g>
  );

  /** An isometric cube: light top, coloured left face, shaded right face. */
  const cube = (x: number, y: number, a: number, color: string) => {
    const w = a * 0.866;
    const top = `${x},${y - a / 2} ${x + w},${y} ${x},${y + a / 2} ${x - w},${y}`;
    const left = `${x - w},${y} ${x},${y + a / 2} ${x},${y + a * 1.5} ${x - w},${y + a}`;
    const right = `${x},${y + a / 2} ${x + w},${y} ${x + w},${y + a} ${x},${y + a * 1.5}`;
    return (
      <g key={`c${x}-${y}`}>
        <polygon points={left} fill={color} />
        <polygon points={right} fill={color} />
        <polygon points={right} fill="#000" opacity="0.25" />
        <polygon points={top} fill={color} />
        <polygon points={top} fill="#fff" opacity="0.5" />
      </g>
    );
  };

  /** A competition icon on a glossy bubble. */
  const bubble = ([Icon, x, y, size, rotate, tinted]: (typeof DOODLES)[number]) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2 + 8;
    const color = tinted ? tint : ink;
    return (
      <g key={`b${x}-${y}`} opacity="0.85">
        <ellipse cx={cx + 2} cy={cy + r * 0.95} rx={r * 0.8} ry={r * 0.2} fill="#0b1b3a" opacity="0.1" filter={u("soft")} />
        <circle cx={cx} cy={cy} r={r} fill="#ffffff" />
        <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.14" />
        <circle cx={cx} cy={cy} r={r} fill={u("rim")} opacity="0.55" />
        <g transform={`rotate(${rotate} ${cx} ${cy})`} opacity="0.6">
          <Icon x={x} y={y} width={size} height={size} strokeWidth={1.7} color={color} />
        </g>
        <circle cx={cx} cy={cy} r={r} fill={u("shine")} opacity="0.9" />
      </g>
    );
  };

  const layer = (anchor: "top" | "bottom", children: ReactNode) => (
    <svg
      className={`pointer-events-none absolute inset-x-0 w-full ${anchor === "top" ? "top-0" : "bottom-0"}`}
      viewBox={anchor === "top" ? "0 0 420 430" : "0 440 420 560"}
      aria-hidden
    >
      {children}
    </svg>
  );

  return (
    <>
      {/* Base: paper, washes, pattern. Stretches with the card. Holds the shared gradients. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 420 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6ea" />
            <stop offset="0.55" stopColor="#fffdf8" />
            <stop offset="1" stopColor="#f3f6fc" />
          </linearGradient>
          <radialGradient id={`${id}-orange`} cx="1" cy="0" r="0.8">
            <stop offset="0" stopColor="#f4782a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#f4782a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-blue`} cx="0" cy="1" r="0.75">
            <stop offset="0" stopColor={ink} stopOpacity="0.22" />
            <stop offset="1" stopColor={ink} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-accent`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={accent} stopOpacity="0.16" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}-stars`} width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M21 5 L25 17 L37 21 L25 25 L21 37 L17 25 L5 21 L17 17 Z" fill="none" stroke={ink} strokeWidth="0.9" />
            <circle cx="21" cy="21" r="2" fill="none" stroke={ink} strokeWidth="0.7" />
          </pattern>
          <filter id={`${id}-brush`} x="-20%" y="-50%" width="140%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="14" />
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <filter id={`${id}-soft`} x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {/* 3D shading, shared by every sphere and bubble whatever its colour */}
          <radialGradient id={`${id}-shine`} cx="0.34" cy="0.3" r="0.45">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-rim`} cx="0.42" cy="0.4" r="0.62">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </radialGradient>
          <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd2b0" />
            <stop offset="0.5" stopColor="#f4782a" />
            <stop offset="1" stopColor="#b8410f" />
          </linearGradient>
          {/* Faisal Mosque shading: lit from the left */}
          <linearGradient id={`${id}-hall-lit`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d3ddf0" />
          </linearGradient>
          <linearGradient id={`${id}-hall-shade`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b7c7e6" />
            <stop offset="1" stopColor="#7d95c4" />
          </linearGradient>
          <linearGradient id={`${id}-minaret`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#dbe4f4" />
            <stop offset="1" stopColor="#8ea3cd" />
          </linearGradient>
        </defs>
        <rect width="420" height="1000" fill={u("paper")} />
        <rect width="420" height="1000" fill={u("orange")} />
        <rect width="420" height="1000" fill={u("blue")} />
        <ellipse cx="210" cy="620" rx="260" ry="220" fill={u("accent")} />
        <rect width="420" height="1000" fill={u("stars")} opacity="0.1" />
      </svg>

      {/* Top: measured from the card's top edge */}
      {layer(
        "top",
        <>
          <g filter={u("brush")}>
            <path d="M250 10 C 320 30, 380 18, 440 40 L 440 70 C 380 52, 320 70, 240 46 Z" fill="#f4782a" opacity="0.32" />
            <path d="M-20 300 C 30 288, 70 300, 100 294 L 97 312 C 64 320, 26 312, -20 322 Z" fill="#ef432c" opacity="0.22" />
          </g>
          <g opacity="0.9">
            {sphere(-6, 34, 42, "#f4782a")}
            {sphere(338, 112, 11, "#315fac")}
            {cube(100, 64, 15, "#315fac")}
            {cube(396, 292, 11, "#f4782a")}
          </g>
          {DOODLES.filter((d) => d[2] < 430).map(bubble)}
          <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.35">
            <path d="M40 120 q6 -6 12 0 q6 -6 12 0" />
            <path d="M70 96 q4 -4 8 0 q4 -4 8 0" />
            <path d="M24 92 q3 -3 6 0 q3 -3 6 0" />
            <path d="M336 150 q5 -5 10 0 q5 -5 10 0" />
            <path d="M362 132 q3 -3 6 0 q3 -3 6 0" />
          </g>
        </>,
      )}

      {/* Bottom: measured from the card's bottom edge */}
      {layer(
        "bottom",
        <>
          <g filter={u("brush")}>
            <path d="M-20 690 C 30 676, 80 690, 120 682 L 118 706 C 80 714, 30 704, -20 714 Z" fill={tint} opacity="0.28" />
            <path d="M-20 800 C 40 788, 90 800, 130 792 L 128 810 C 90 818, 40 808, -20 818 Z" fill={ink} opacity="0.16" />
          </g>
          <g opacity="0.9">
            {sphere(406, 470, 17, tint)}
            {sphere(-2, 470, 13, "#315fac")}
            {sphere(404, 876, 10, "#f4782a")}
            {/* a glossy ring, half off the edge */}
            <g transform="rotate(-24 414 560)">
              <ellipse cx="414" cy="566" rx="34" ry="12" fill="none" stroke="#0b1b3a" strokeOpacity="0.12" strokeWidth="11" filter={u("soft")} />
              <ellipse cx="414" cy="560" rx="34" ry="12" fill="none" stroke={u("ring")} strokeWidth="11" />
              <ellipse cx="414" cy="556" rx="34" ry="12" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
            </g>
          </g>

          {/* Faisal Mosque: tent-shaped prayer hall with four pencil minarets, shaded in 3D */}
          <g transform="translate(292 642) scale(0.78)" opacity="0.85">
            <ellipse cx="75" cy="166" rx="80" ry="6" fill="#0b1b3a" opacity="0.15" filter={u("soft")} />
            {[30, 114].map((x) => (
              <g key={x} opacity="0.75">
                <rect x={x} y="46" width="5" height="114" fill={u("minaret")} />
                <polygon points={`${x - 0.5},46 ${x + 2.5},22 ${x + 5.5},46`} fill={u("minaret")} />
                <rect x={x - 1.5} y="80" width="8" height="3" fill="#b8c7e4" />
              </g>
            ))}
            <path d="M22 160 Q 50 112 75 54 L 75 160 Z" fill={u("hall-lit")} />
            <path d="M75 54 Q 100 112 128 160 L 75 160 Z" fill={u("hall-shade")} />
            <path d="M22 160 Q 50 112 75 54 Q 100 112 128 160" fill="none" stroke="#6f87b8" strokeWidth="1" />
            <path d="M75 54 L 48 160 M75 54 L 102 160" stroke="#8ea3cd" strokeWidth="0.8" opacity="0.7" />
            <path d="M64 160 L 75 126 L 86 160 Z" fill="#4f6aa3" opacity="0.75" />
            {[4, 140].map((x) => (
              <g key={x}>
                <rect x={x} y="22" width="7" height="138" fill={u("minaret")} />
                <polygon points={`${x - 0.5},22 ${x + 3.5},-8 ${x + 7.5},22`} fill={u("minaret")} />
                <rect x={x - 2} y="58" width="11" height="3.5" rx="1" fill="#c6d3ec" />
                <rect x={x - 2} y="98" width="11" height="3.5" rx="1" fill="#c6d3ec" />
                <rect x={x} y="22" width="7" height="138" fill="none" stroke="#8ea3cd" strokeWidth="0.6" />
              </g>
            ))}
            <rect x="-2" y="160" width="153" height="6" rx="1" fill={u("hall-lit")} stroke="#a9badc" strokeWidth="0.6" />
          </g>

          {DOODLES.filter((d) => d[2] >= 430).map(bubble)}
        </>,
      )}
    </>
  );
}
