import { useCallback } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { keccak256, encodePacked, type Address } from "viem";
import {
  CCO2_ABI,
  CCO2_ADDRESS,
  CREDIT_ISSUER_ABI,
  CREDIT_ISSUER_ADDRESS,
  CREDIT_RETIRE_ABI,
  CREDIT_RETIRE_ADDRESS,
  CAP_REGISTRY_ABI,
  CAP_REGISTRY_ADDRESS,
} from "@/config/contracts";
import { getGasFees } from "@/lib/gas";
import { decryptUint64, describeFheError, encryptUint64 } from "@/lib/fhe";
import { useFHEStatus } from "./useFHEStatus";

const GAS = {
  registerAsEmitter: 150_000n,
  issueCredits: 900_000n,
  retireCredits: 800_000n,
} as const;

export function useCarbonCredits() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const fhe = useFHEStatus();

  const registryRole = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "roleOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const balanceIndicator = useReadContract({
    address: CCO2_ADDRESS,
    abi: CCO2_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const confidentialBalance = useReadContract({
    address: CCO2_ADDRESS,
    abi: CCO2_ABI,
    functionName: "confidentialBalanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  function ensureClients() {
    if (!publicClient || !walletClient) throw new Error("Wallet not connected");
    return { publicClient, walletClient };
  }

  const registerAsEmitter = useCallback(async () => {
    const fees = await getGasFees(publicClient);
    return writeContractAsync({
      address: CAP_REGISTRY_ADDRESS,
      abi: CAP_REGISTRY_ABI,
      functionName: "registerAsEmitter",
      gas: GAS.registerAsEmitter,
      ...fees,
    });
  }, [publicClient, writeContractAsync]);

  const issueCredits = useCallback(
    async (company: Address, reportingYear: number) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CREDIT_ISSUER_ADDRESS,
        abi: CREDIT_ISSUER_ABI,
        functionName: "issueCredits",
        args: [company, BigInt(reportingYear)],
        gas: GAS.issueCredits,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const retireCredits = useCallback(
    async (amountTonnes: bigint, year: number, nonce: bigint = 0n) => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      if (!address) throw new Error("Wallet not connected");
      try {
        fhe.setStep("ENCRYPTING");
        const encAmount = await encryptUint64(pc, wc, amountTonnes, fhe.setLabel);
        const retirementId = keccak256(
          encodePacked(["address", "uint256", "uint256"], [address, BigInt(year), nonce]),
        );
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CREDIT_RETIRE_ADDRESS,
          abi: CREDIT_RETIRE_ABI,
          functionName: "retireCredits",
          args: [encAmount as never, retirementId],
          gas: GAS.retireCredits,
          ...fees,
        });
        fhe.setStep("READY");
        return { hash, retirementId };
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync, address],
  );

  const decryptBalance = useCallback(async () => {
    const handle = confidentialBalance.data as bigint | undefined;
    if (!handle) throw new Error("No encrypted balance handle");
    const { publicClient: pc, walletClient: wc } = ensureClients();
    fhe.setStep("COMPUTING");
    const value = await decryptUint64(pc, wc, handle, fhe.setLabel);
    fhe.setStep("READY");
    return value;
  }, [confidentialBalance.data, publicClient, walletClient, fhe]);

  return {
    address,
    role: (registryRole.data ?? 0) as number,
    balanceIndicator: (balanceIndicator.data ?? 0n) as bigint,
    confidentialBalanceHandle: (confidentialBalance.data ?? 0n) as bigint,
    hasBalance: !!(confidentialBalance.data as bigint | undefined),
    fheStep: fhe.step,
    fheStepLabel: fhe.stepLabel,
    fheError: fhe.errorMessage,
    fheWorking: fhe.isWorking,
    registerAsEmitter,
    issueCredits,
    retireCredits,
    decryptBalance,
    refetchBalance: () => {
      balanceIndicator.refetch();
      confidentialBalance.refetch();
    },
  };
}
