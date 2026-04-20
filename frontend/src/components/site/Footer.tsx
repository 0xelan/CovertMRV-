import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <span className="font-mono text-base font-medium">
                Covert<span className="text-emerald">MRV</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm font-mono text-sm text-foreground/55">
              Prove compliance. Reveal nothing.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/45">
              Encrypted Measurement, Reporting & Verification protocol for global
              climate compliance and carbon markets.
            </p>
          </div>

          {[
            {
              title: "Protocol",
              links: [
                ["Architecture", "/docs"],
                ["Dashboard", "/dashboard"],
                ["Roadmap", "/docs"],
              ],
            },
            {
              title: "Developers",
              links: [
                ["Documentation", "/docs"],
                ["Smart Contracts", "/docs"],
                ["GitHub", "/docs"],
              ],
            },
            {
              title: "Resources",
              links: [
                ["FHE Primer", "/docs"],
                ["Disclosure Model", "/docs"],
                ["Compliance FAQ", "/docs"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/40">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-foreground/70 transition hover:text-emerald"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-foreground/10 pt-8 md:flex-row md:items-center">
          <p className="font-mono text-xs text-foreground/40">
            © {new Date().getFullYear()} CovertMRV Protocol · Built on Fhenix CoFHE
          </p>
          <p className="font-mono text-xs text-foreground/40">
            Arbitrum Sepolia · v0.2.0 · status: operational
          </p>
        </div>
      </div>
    </footer>
  );
}
