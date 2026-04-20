import { motion } from "framer-motion";

const E = "oklch(0.72 0.18 155)"; // emerald
const E_DIM = "oklch(0.72 0.18 155 / 0.35)";
const FG = "oklch(0.95 0.01 240)";
const FG_DIM = "oklch(0.95 0.01 240 / 0.18)";
const BLUE = "oklch(0.7 0.13 235)";
const AMBER = "oklch(0.78 0.15 75)";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ====================================================================
   FlowDiagram — How It Works
   client → CapRegistry → CapCheck → DisclosureACL → roles
==================================================================== */

export function FlowDiagram() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 p-6 backdrop-blur">
      <svg
        viewBox="0 0 1200 360"
        className="h-auto w-full"
        role="img"
        aria-label="Encrypted MRV data flow"
      >
        <defs>
          <linearGradient id="flow-pipe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={E_DIM} />
            <stop offset="50%" stopColor={E} />
            <stop offset="100%" stopColor={E_DIM} />
          </linearGradient>
          <filter id="flow-glow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <g opacity={0.18}>
          {Array.from({ length: 13 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 100}
              y1={0}
              x2={i * 100}
              y2={360}
              stroke={FG_DIM}
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 90}
              x2={1200}
              y2={i * 90}
              stroke={FG_DIM}
              strokeWidth={0.5}
            />
          ))}
        </g>

        {/* Pipeline path */}
        <motion.path
          d="M 100 180 H 1100"
          stroke="url(#flow-pipe)"
          strokeWidth={2}
          strokeDasharray="6 6"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
        />

        {/* Encrypted packets traveling on pipeline */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r={5}
            fill={E}
            filter="url(#flow-glow)"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{
              duration: 4,
              delay: i * 1.3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ offsetPath: 'path("M 100 180 H 1100")' }}
          />
        ))}

        {/* Nodes */}
        {[
          { x: 100, label: "Client", sub: "@cofhe/sdk", code: "encrypt()" },
          { x: 400, label: "CapRegistry", sub: "storage", code: "FHE.add()" },
          { x: 700, label: "CapCheck", sub: "verifier", code: "FHE.lte()" },
          { x: 1000, label: "DisclosureACL", sub: "roles", code: "FHE.allow()" },
        ].map((n, i) => (
          <motion.g
            key={n.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
          >
            {/* Node ring */}
            <circle cx={n.x} cy={180} r={42} fill="oklch(0.21 0.035 240)" stroke={E} strokeWidth={1.5} />
            <circle cx={n.x} cy={180} r={28} fill="oklch(0.16 0.03 240)" stroke={E_DIM} strokeWidth={1} />
            <text
              x={n.x}
              y={184}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={10}
              fill={E}
            >
              {String(i).padStart(2, "0")}
            </text>

            {/* Top label */}
            <text
              x={n.x}
              y={108}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={13}
              fontWeight={600}
              fill={FG}
            >
              {n.label}
            </text>
            <text
              x={n.x}
              y={126}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={10}
              fill={`${FG} / 0.5`}
              opacity={0.5}
            >
              {n.sub}
            </text>

            {/* Bottom code */}
            <rect
              x={n.x - 60}
              y={240}
              width={120}
              height={28}
              rx={4}
              fill="oklch(0.21 0.035 240)"
              stroke={FG_DIM}
            />
            <text
              x={n.x}
              y={258}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={11}
              fill={E}
            >
              {n.code}
            </text>
          </motion.g>
        ))}

        {/* Label: ENCRYPTED end-to-end */}
        <text
          x={600}
          y={325}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={10}
          fill={FG}
          opacity={0.45}
          letterSpacing={3}
        >
          CIPHERTEXT IN · CIPHERTEXT THROUGH · CIPHERTEXT OUT
        </text>
      </svg>
    </div>
  );
}

/* ====================================================================
   DisclosurePyramid — five-level access spectrum (radial)
==================================================================== */

export function DisclosurePyramid() {
  const levels = [
    { l: "L4", title: "Proof", who: "Public", color: AMBER },
    { l: "L3", title: "Boolean", who: "Regulator", color: BLUE },
    { l: "L2", title: "Band", who: "Buyer", color: "oklch(0.7 0.16 195)" },
    { l: "L1", title: "Total", who: "Auditor", color: "oklch(0.72 0.18 155)" },
    { l: "L0", title: "Raw", who: "Self", color: E },
  ];
  return (
    <div className="relative w-full rounded-2xl border border-foreground/10 bg-background/60 p-6">
      <svg viewBox="0 0 600 460" className="w-full" role="img" aria-label="Disclosure pyramid">
        <defs>
          <radialGradient id="pyr-glow" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor={E} stopOpacity={0.22} />
            <stop offset="100%" stopColor={E} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={300} cy={420} rx={260} ry={40} fill="url(#pyr-glow)" />

        {levels.map((lvl, i) => {
          const w = 80 + (4 - i) * 90;
          const y = 60 + i * 70;
          const x = 300 - w / 2;
          return (
            <motion.g
              key={lvl.l}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={50}
                rx={6}
                fill="oklch(0.21 0.035 240)"
                stroke={lvl.color}
                strokeWidth={1.4}
              />
              <text
                x={300}
                y={y + 22}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={11}
                fill={lvl.color}
              >
                {lvl.l} · {lvl.title.toUpperCase()}
              </text>
              <text
                x={300}
                y={y + 40}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize={11}
                fill={FG}
                opacity={0.55}
              >
                {lvl.who}
              </text>

              {/* Connector tick */}
              <line
                x1={x + w + 8}
                y1={y + 25}
                x2={x + w + 80}
                y2={y + 25}
                stroke={lvl.color}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <circle cx={x + w + 86} cy={y + 25} r={3} fill={lvl.color} />
            </motion.g>
          );
        })}

        {/* Lock icon at apex */}
        <g transform="translate(290 18)">
          <rect x={2} y={14} width={18} height={14} rx={2} fill={E} />
          <path
            d="M5 14 V9 a6 6 0 0 1 12 0 V14"
            fill="none"
            stroke={E}
            strokeWidth={2}
          />
        </g>
      </svg>
    </div>
  );
}

/* ====================================================================
   FHEOrbit — comparison: ZK / MPC / TEE / FHE around a center
==================================================================== */

export function FHEOrbit() {
  const items = [
    { label: "ZK", angle: 0, fail: true, note: "cap leaks" },
    { label: "MPC", angle: 90, fail: true, note: "all online" },
    { label: "TEE", angle: 180, fail: true, note: "hw trust" },
    { label: "FHE", angle: 270, fail: false, note: "ciphertext math" },
  ];
  const cx = 300;
  const cy = 220;
  const r = 130;

  return (
    <div className="relative w-full rounded-2xl border border-foreground/10 bg-background/60 p-6">
      <svg viewBox="0 0 600 440" className="w-full" role="img" aria-label="Cryptography comparison">
        <defs>
          <radialGradient id="orbit-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={E} stopOpacity={0.35} />
            <stop offset="100%" stopColor={E} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Concentric rings */}
        {[60, 100, 130, 160].map((rr, i) => (
          <circle
            key={rr}
            cx={cx}
            cy={cy}
            r={rr}
            fill="none"
            stroke={FG_DIM}
            strokeWidth={0.6}
            strokeDasharray={i % 2 ? "2 4" : undefined}
          />
        ))}

        {/* Rotating tick ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i * 10 * Math.PI) / 180;
            // Round to 4 dp so Node.js (SSR) and browser V8 (CSR) produce the
            // same string — without rounding the last 1–2 digits differ due to
            // floating-point implementation variance, causing a hydration mismatch.
            const r4 = (n: number) => Math.round(n * 1e4) / 1e4;
            const x1 = r4(cx + Math.cos(a) * 158);
            const y1 = r4(cy + Math.sin(a) * 158);
            const x2 = r4(cx + Math.cos(a) * 165);
            const y2 = r4(cy + Math.sin(a) * 165);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 9 === 0 ? E : FG_DIM}
                strokeWidth={i % 9 === 0 ? 1.2 : 0.6}
              />
            );
          })}
        </motion.g>

        {/* Core */}
        <circle cx={cx} cy={cy} r={45} fill="url(#orbit-core)" />
        <circle cx={cx} cy={cy} r={26} fill="oklch(0.21 0.035 240)" stroke={E} strokeWidth={1.4} />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={11}
          fill={E}
        >
          ENCRYPTED
        </text>

        {/* Items */}
        {items.map((it, i) => {
          const a = (it.angle * Math.PI) / 180;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const color = it.fail ? "oklch(0.62 0.22 25)" : E;
          return (
            <motion.g
              key={it.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 180, damping: 16 }}
            >
              {/* connector */}
              <line
                x1={cx + Math.cos(a) * 35}
                y1={cy + Math.sin(a) * 35}
                x2={x - Math.cos(a) * 25}
                y2={y - Math.sin(a) * 25}
                stroke={color}
                strokeOpacity={0.45}
                strokeWidth={1}
                strokeDasharray={it.fail ? "4 3" : undefined}
              />
              <circle cx={x} cy={y} r={28} fill="oklch(0.21 0.035 240)" stroke={color} strokeWidth={1.4} />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={12}
                fontWeight={600}
                fill={color}
              >
                {it.label}
              </text>
              <text
                x={x}
                y={y + 50}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={9}
                fill={FG}
                opacity={0.5}
              >
                {it.note}
              </text>
              {it.fail && (
                <text
                  x={x}
                  y={y - 36}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={9}
                  fill="oklch(0.62 0.22 25)"
                  opacity={0.85}
                >
                  ✕ blocked
                </text>
              )}
              {!it.fail && (
                <text
                  x={x}
                  y={y - 36}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={9}
                  fill={E}
                >
                  ✓ viable
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/* ====================================================================
   Sparkline — small encrypted-looking chart
==================================================================== */

export function Sparkline({
  values,
  height = 40,
  className,
}: {
  values: number[];
  height?: number;
  className?: string;
}) {
  const w = 120;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      width={w}
      height={height}
      className={className}
    >
      <motion.polyline
        points={pts}
        fill="none"
        stroke={E}
        strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <polyline
        points={`${pts} ${w},${height} 0,${height}`}
        fill={E}
        opacity={0.08}
      />
    </svg>
  );
}
