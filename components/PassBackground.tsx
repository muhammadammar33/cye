import { Bot, BookOpen, Brush, Clapperboard, CodeXml, Drone, Landmark, Lightbulb, Mic, Palette, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Competition doodles around the edges of the pass, kept clear of the text and QR code. Positions are in the
 * 420 x 1000 viewBox below: [icon, x, y, size, rotation, uses the pass colour].
 */
const DOODLES: [LucideIcon, number, number, number, number, boolean][] = [
  [Bot, 16, 164, 40, -12, false], // Robo War, Line Following Robot
  [Drone, 348, 176, 42, 10, true], // Drone Race
  [CodeXml, 14, 228, 30, 8, true], // Hackathon, Speed Programming
  [ShieldCheck, 374, 238, 30, -8, false], // Cyber Security
  [Lightbulb, 50, 640, 34, -14, true], // Pitch Your Idea, Business Innovation
  [Mic, 100, 704, 30, 12, false], // Speech, Naat
  [Palette, 34, 762, 36, -6, true], // Arts, Graphic Design
  [Brush, 84, 806, 28, 24, false],
  [Clapperboard, 22, 836, 30, -10, false], // Reel Competition
  [Landmark, 372, 782, 30, -6, false], // Youth Parliament
  [BookOpen, 360, 832, 32, 8, true], // Qirat
];

/**
 * Background art for the entry pass, drawn in SVG so it prints crisply: a warm paper base with CYE orange and
 * blue washes, painted brush swashes, a geometric star pattern (after the venue's facade), a line drawing of
 * Faisal Mosque and a few birds. `accent` is the pass type's colour, so each pass type is tinted its own way.
 */
export function PassBackground({ accent, id }: { accent: string; id: string }) {
  const ink = "#1b4694";
  // A near-black pass colour (Event Team) would paint grey smudges; use CYE orange for its swash instead.
  const swash = accent === "#111827" ? "#f4782a" : accent;
  return (
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
        {/* Rough, painterly edges for the brush swashes. */}
        <filter id={`${id}-brush`} x="-20%" y="-50%" width="140%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Paper and colour washes */}
      <rect width="420" height="1000" fill={`url(#${id}-paper)`} />
      <rect width="420" height="1000" fill={`url(#${id}-orange)`} />
      <rect width="420" height="1000" fill={`url(#${id}-blue)`} />
      <ellipse cx="210" cy="620" rx="260" ry="220" fill={`url(#${id}-accent)`} />
      <rect width="420" height="1000" fill={`url(#${id}-stars)`} opacity="0.1" />

      {/* Painted swashes */}
      <g filter={`url(#${id}-brush)`}>
        <path d="M250 10 C 320 30, 380 18, 440 40 L 440 70 C 380 52, 320 70, 240 46 Z" fill="#f4782a" opacity="0.32" />
        <path d="M-20 300 C 30 288, 70 300, 100 294 L 97 312 C 64 320, 26 312, -20 322 Z" fill="#ef432c" opacity="0.22" />
        <path d="M-20 690 C 30 676, 80 690, 120 682 L 118 706 C 80 714, 30 704, -20 714 Z" fill={swash} opacity="0.28" />
        <path d="M-20 800 C 40 788, 90 800, 130 792 L 128 810 C 90 818, 40 808, -20 818 Z" fill={ink} opacity="0.16" />
      </g>

      {/* Faisal Mosque, line drawing on the right */}
      <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" opacity="0.2" transform="translate(292 640) scale(0.8)">
        {/* prayer hall: the tent-like roof */}
        <path d="M20 150 L72 40 L124 150" />
        <path d="M34 150 L72 66 L110 150" />
        <path d="M72 40 L72 150" />
        <path d="M10 150 H134" />
        {/* four minarets */}
        {[0, 14, 130, 144].map((x) => (
          <g key={x}>
            <path d={`M${x} 150 V30 M${x + 4} 150 V30`} />
            <path d={`M${x - 1} 30 L${x + 2} 6 L${x + 5} 30 Z`} />
            <path d={`M${x - 2} 70 H${x + 6} M${x - 2} 110 H${x + 6}`} />
          </g>
        ))}
        <path d="M-6 160 H150" />
      </g>

      {/* Competition doodles */}
      <g opacity="0.28">
        {DOODLES.map(([Icon, x, y, size, rotate, accented], i) => (
          <g key={i} transform={`rotate(${rotate} ${x + size / 2} ${y + size / 2})`}>
            <Icon x={x} y={y} width={size} height={size} strokeWidth={1.6} color={accented ? swash : ink} />
          </g>
        ))}
      </g>

      {/* Birds */}
      <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.35">
        <path d="M40 120 q6 -6 12 0 q6 -6 12 0" />
        <path d="M70 96 q4 -4 8 0 q4 -4 8 0" />
        <path d="M24 92 q3 -3 6 0 q3 -3 6 0" />
        <path d="M336 150 q5 -5 10 0 q5 -5 10 0" />
        <path d="M362 132 q3 -3 6 0 q3 -3 6 0" />
      </g>
    </svg>
  );
}
