import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import { Counter } from "./Counter";
import { Magnetic } from "./motion-primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "saturate(1.05) contrast(1.05)" }}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: EASE }}
        />
        {/* Vignette + readability gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      {/* Faint engineering grid overlay */}
      <div className="absolute inset-0 grid-faint opacity-60" />
      <div className="absolute inset-0 grain" />

      {/* Crosshair guides */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[33%] top-0 h-full w-px bg-foreground/[0.06]" />
        <div className="absolute right-[33%] top-0 h-full w-px bg-foreground/[0.06]" />
        <div className="absolute left-0 top-[18%] h-px w-full bg-foreground/[0.06]" />
      </div>

      {/* Floating ciphertext tokens */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {[
          { x: "12%", y: "28%", t: "euint64::0x44ab…aa01", delay: 0.6 },
          { x: "78%", y: "62%", t: "FHE.add()", delay: 1.0 },
          { x: "8%", y: "72%", t: "ebool::sealed", delay: 1.4 },
          { x: "85%", y: "22%", t: "FHE.lte(t,c)", delay: 1.2 },
        ].map((c) => (
          <motion.span
            key={c.t}
            className="absolute font-mono text-[10px] tracking-wider text-emerald/55"
            style={{ left: c.x, top: c.y }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 0.85, 0.55], y: 0 }}
            transition={{ duration: 1.6, delay: c.delay, ease: EASE }}
          >
            {c.t}
          </motion.span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1480px] flex-col px-6 pb-16 pt-40 md:px-10 md:pt-48">
        <div className="grid flex-1 items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          {/* Left: headline */}
          <div className="lg:col-span-2 max-w-2xl">
            <motion.div
              className="inline-flex items-center gap-3 rounded-full border border-foreground/20 bg-foreground/[0.04] py-1 pl-1 pr-4 backdrop-blur"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="rounded-full bg-foreground px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-background">
                Live
              </span>
              <span className="font-mono text-xs text-foreground/75">
                CapCheck v0.2 · Arbitrum Sepolia
              </span>
              <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            </motion.div>

            <h1 className="font-display mt-8 text-5xl font-normal leading-[0.95] tracking-tight text-balance md:text-6xl lg:text-[88px]">
              {["Prove", "Compliance.", "Reveal Nothing."].map((line, i) => (
                <motion.span
                  key={line}
                  className={`block ${i === 2 ? "text-foreground/35" : ""}`}
                  initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mt-7 max-w-xl text-[15px] leading-relaxed text-foreground/65"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            >
              The first encrypted MRV protocol for climate compliance. Companies
              prove they meet emissions caps without exposing facility data,
              supplier secrets, or trade strategy. Built on Fully Homomorphic
              Encryption.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
            >
              <Magnetic strength={0.3}>
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[14px] font-semibold text-background transition hover:bg-foreground/90"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link
                  to="/docs"
                  className="group inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-foreground/[0.04] px-6 py-3 text-[14px] font-semibold text-foreground backdrop-blur transition hover:border-emerald hover:text-emerald"
                >
                  <BookOpen className="h-4 w-4" />
                  Read Architecture
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              className="mt-10 flex items-center gap-3 font-mono text-[11px] text-foreground/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <Sparkles className="h-3 w-3 text-emerald" />
              <span>
                FHE.add() · FHE.lte() · FHE.allow() — 11 operations, zero plaintext
              </span>
            </motion.div>
          </div>

          {/* Right: stat rail */}
          <div className="hidden flex-col gap-12 self-center lg:flex">
            <Counter value="$909B" label="Global Carbon Market" />
            <Counter value="70–90%" label="Emissions Are Supply Chain" delay={120} />
            <Counter value="11" label="FHE Operations" delay={240} />
          </div>
        </div>

        {/* Mobile stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 lg:hidden">
          <Counter value="$909B" label="Carbon Market" />
          <Counter value="70–90%" label="Scope 3 Share" />
          <Counter value="11" label="FHE Ops" />
        </div>

        {/* Bottom rail */}
        <div className="mt-16 flex items-center justify-between border-t border-foreground/10 pt-5 font-mono text-[11px] text-foreground/45">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            00:01 / 00:07 · ENCRYPTED STREAM
          </span>
          <span className="hidden md:inline">
            handle://0xa9f3…c7e1 · euint64 · CIPHERTEXT
          </span>
          <span>scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
