import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

/**
 * CovertMRV mark — encrypted shield + padlock.
 * Hex shield = institutional perimeter. Padlock = sealed ciphertext.
 */
export function Logo({ size = 36, animate = false, className }: LogoProps) {
  const Inner = (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="CovertMRV"
    >
      <defs>
        <linearGradient id="cm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.18 155)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 155)" />
        </linearGradient>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hex shield outline */}
      <motion.path
        d="M32 6 L54 17 L54 41 L32 58 L10 41 L10 17 Z"
        fill="none"
        stroke="url(#cm-grad)"
        strokeWidth={2.4}
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        filter="url(#cm-glow)"
      />

      {/* Tick marks on hex edges (engineering survey feel) */}
      {[
        [32, 6],
        [54, 17],
        [54, 41],
        [32, 58],
        [10, 41],
        [10, 17],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={1.2}
          fill="oklch(0.72 0.18 155)"
        />
      ))}

      {/* Padlock body */}
      <motion.rect
        x={22}
        y={30}
        width={20}
        height={15}
        rx={2.2}
        fill="url(#cm-grad)"
        initial={animate ? { scale: 0, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: "32px 37px" }}
      />

      {/* Padlock shackle */}
      <motion.path
        d="M26 30 V24.5 a6 6 0 0 1 12 0 V30"
        fill="none"
        stroke="url(#cm-grad)"
        strokeWidth={2.6}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.4, duration: 0.7 }}
      />

      {/* Keyhole */}
      <circle cx={32} cy={36.5} r={1.8} fill="oklch(0.16 0.03 240)" />
      <rect x={31.1} y={36.5} width={1.8} height={4.4} fill="oklch(0.16 0.03 240)" />
    </svg>
  );
  return Inner;
}

/** Wordmark — used in nav/footer */
export function LogoWord({
  size = 32,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={size} animate={animate} />
      <span className="font-mono text-[15px] font-medium tracking-tight">
        Covert<span className="text-emerald">MRV</span>
      </span>
    </div>
  );
}
