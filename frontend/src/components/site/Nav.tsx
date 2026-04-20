import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ConnectWallet } from "@/components/shared/ConnectWallet";

export function Nav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="group flex items-center gap-2.5 text-foreground">
          <Logo size={36} className="transition-transform group-hover:rotate-[6deg]" />
          <span className="font-mono text-[15px] font-medium tracking-tight">
            Covert<span className="text-emerald">MRV</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-foreground/15 bg-foreground/[0.04] px-2 py-1.5 backdrop-blur-md md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/docs", label: "Architecture" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-foreground text-background" }}
              className="rounded-full px-5 py-2 text-[13px] font-medium text-foreground/80 transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/docs"
            className="hidden text-[13px] font-medium text-foreground/70 transition hover:text-foreground md:block"
          >
            Architecture
          </Link>
          <ConnectWallet />
          <Link
            to="/dashboard"
            className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
          >
            Launch dApp
          </Link>
        </div>
      </div>
    </header>
  );
}
