import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: string;
  label: string;
  delay?: number;
}

/**
 * Renders a static prefix-aware counter that animates the numeric portion
 * on first scroll-into-view.
 */
export function Counter({ value, label, delay = 0 }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="border-l border-foreground/15 pl-5">
      <p
        className={`font-display text-4xl font-medium tabular-nums transition-all duration-700 md:text-[44px] ${
          shown ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 max-w-[14ch] font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-foreground/55">
        {label}
      </p>
    </div>
  );
}
