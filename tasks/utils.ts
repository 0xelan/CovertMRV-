import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createCofheConfig,
  createCofheClient as createCofheClientBase,
} from "@cofhe/sdk/node";
import { getChainById } from "@cofhe/sdk/chains";

/// Create a CoFHE client that works for both the local hardhat mock
/// environment and any of the real testnets (eth-sepolia, arb-sepolia).
export const createCofheClient = async (
  hre: HardhatRuntimeEnvironment,
  signer: HardhatEthersSigner
) => {
  const chainId = Number((await signer.provider.getNetwork()).chainId);
  const chain = getChainById(chainId);

  if (!chain) {
    throw new Error(
      `No CoFHE chain configuration found for chainId ${chainId}. ` +
        `Supported chains live in @cofhe/sdk/chains.`
    );
  }

  if (chain.environment === "MOCK") {
    return hre.cofhe.createClientWithBatteries(signer);
  }

  const config = createCofheConfig({
    environment: "node",
    supportedChains: [chain],
  });
  const client = createCofheClientBase(config);
  const { publicClient, walletClient } = await hre.cofhe.hardhatSignerAdapter(
    signer
  );
  await client.connect(publicClient, walletClient);
  await client.permits.createSelf({ issuer: signer.address });
  return client;
};
