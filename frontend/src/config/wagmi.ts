import { arbitrumSepolia } from "viem/chains";
import { http } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ||
  // RainbowKit requires a project id; use a placeholder for local dev so the
  // app does not crash. Mobile / WalletConnect transports will be inert until
  // the user supplies a real id from https://cloud.walletconnect.com.
  "covertmrv-local-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "CovertMRV",
  projectId,
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(
      "https://sepolia-rollup.arbitrum.io/rpc"
    ),
  },
  ssr: false,
});

export { arbitrumSepolia };
