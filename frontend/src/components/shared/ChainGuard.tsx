import { useAccount, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "@/config/wagmi";
import { AlertTriangle } from "lucide-react";

/// Banner shown above the dashboard when the wallet is on the wrong chain.
export function ChainGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  if (!isConnected || chainId === arbitrumSepolia.id) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-warn/40 bg-amber-warn/10 px-10 py-3 text-amber-warn">
      <div className="flex items-center gap-2 text-[13px]">
        <AlertTriangle className="h-4 w-4" />
        <span>
          Wrong network — CovertMRV requires Arbitrum Sepolia ({arbitrumSepolia.id}).
        </span>
      </div>
      <button
        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-amber-warn/40 bg-amber-warn/10 px-4 py-1.5 text-[12px] font-semibold text-amber-warn transition hover:bg-amber-warn/20 disabled:opacity-60"
      >
        {isPending ? "Switching…" : "Switch network"}
      </button>
    </div>
  );
}
