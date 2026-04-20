import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

/// RainbowKit connect button styled to match the CovertMRV institutional look.
export function ConnectWallet({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={
                      variant === "compact"
                        ? "inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-4 py-2 text-[12px] font-medium text-foreground transition hover:border-emerald hover:text-emerald"
                        : "inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
                    }
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-[12px] font-semibold text-destructive transition hover:bg-destructive/20"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.04] px-3 py-1.5 font-mono text-[11px] text-foreground/70 transition hover:border-emerald hover:text-emerald sm:inline-flex"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-3.5 py-1.5 font-mono text-[11.5px] text-foreground transition hover:border-emerald"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
