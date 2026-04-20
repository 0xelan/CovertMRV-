import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";

/* ============ Reveal — staggered scroll-in ============ */

export const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const itemReveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "h2" | "h3" | "p" | "span";
  y?: number;
}) {
  const Comp = motion[As as "div"];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemReveal}>
      {children}
    </motion.div>
  );
}

/* ============ MagneticButton — cursor pulls element ============ */

export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============ SpotlightCard — radial light follows cursor ============ */

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "oklch(0.72 0.18 155 / 0.18)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [opacity, setOpacity] = useState(0);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 55%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ============ EncryptedNumber — scramble effect ============ */

const GLYPHS = "0123456789ABCDEF·▓▒░";

export function EncryptedNumber({
  value,
  decrypted,
  className,
  duration = 1200,
}: {
  value: string;
  decrypted: boolean;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    if (!decrypted) {
      // Idle scramble (subtle, slow)
      const id = setInterval(() => {
        setDisplay(
          value
            .split("")
            .map((c) =>
              /[0-9A-Fa-f]/.test(c)
                ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                : c,
            )
            .join(""),
        );
      }, 90);
      return () => clearInterval(id);
    }
    // Decrypt animation: rapid scramble, then settle
    const start = performance.now();
    const id = setInterval(() => {
      const t = (performance.now() - start) / duration;
      if (t >= 1) {
        setDisplay(value);
        clearInterval(id);
        return;
      }
      const lock = Math.floor(t * value.length);
      setDisplay(
        value
          .split("")
          .map((c, i) =>
            i < lock
              ? c
              : /[0-9A-Fa-f]/.test(c)
                ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                : c,
          )
          .join(""),
      );
    }, 35);
    return () => clearInterval(id);
  }, [value, decrypted, duration, inView]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ============ ParallaxLayer — subtle scroll-driven shift ============ */

export function ParallaxY({
  children,
  amount = 40,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      y.set((-center / window.innerHeight) * amount);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [amount, y]);
  return (
    <motion.div ref={ref} style={{ y: sy }} className={className}>
      {children}
    </motion.div>
  );
}

/* ============ Tilt — 3D card tilt on hover ============ */

export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 18,
  });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
