// frontend/src/hooks/useCovertMrv.ts
//
// Single combined hook for every CovertMRV on-chain interaction.
//
// Production patterns adopted from audited FHE dApps:
//   - All writes wrapped in `getGasFees(publicClient)` + explicit `gas:` limits
//     (prevents Arbitrum-Sepolia "max fee < base fee" reverts and silent
//     out-of-gas failures on heavy FHE operations).
//   - Every encrypt/decrypt path streams progress through `useFHEStatus` for
//     a consistent on-screen stepper.
//   - Per-facility encrypted reads pass `account: address` because
//     `getMyEmissions` uses `msg.sender` — without `account` the eth_call
//     has `from = address(0)` and reverts.
//   - CofheError codes mapped to friendly strings via `describeFheError`.

import { useCallback } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import {
  CAP_CHECK_ABI,
  CAP_CHECK_ADDRESS,
  CAP_REGISTRY_ABI,
  CAP_REGISTRY_ADDRESS,
} from "@/config/contracts";
import { getGasFees } from "@/lib/gas";
import {
  decryptBool,
  decryptForSettlement,
  decryptUint64,
  describeFheError,
  encryptUint64,
} from "@/lib/fhe";
import { useFHEStatus } from "./useFHEStatus";

// Per-call gas limits tuned for Arbitrum Sepolia + CoFHE coprocessor.
const GAS = {
  registerAsEmitter: 150_000n,
  submitEmissions: 800_000n,
  aggregateBase: 400_000n,
  aggregatePerFacility: 250_000n,
  setCap: 600_000n,
  grantCheckAccess: 300_000n,
  grantAuditAccess: 300_000n,
  revokeAuditAccess: 200_000n,
  checkCompliance: 900_000n,
  settleCompliance: 600_000n,
} as const;

export function useCovertMrv() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const fhe = useFHEStatus();

  // ─── Reads ─────────────────────────────────────────────────────────
  const myRole = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "roleOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const owner = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "owner",
  });

  const facilityIds = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getFacilityIds",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const companyTotalHandle = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getCompanyTotal",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const complianceHandle = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "getComplianceResult",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Whether the regulator has set an encrypted cap for this address.
  const regulatoryCapHandle = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getRegulatoryCap",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const settledStatus = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "isSettled",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const lastCheckedAt = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "lastCheckedAt",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  function ensureClients() {
    if (!publicClient || !walletClient) {
      throw new Error("Wallet not connected");
    }
    return { publicClient, walletClient };
  }

  // ─── Writes ────────────────────────────────────────────────────────

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

  const submitEmissions = useCallback(
    async (facilityId: bigint, tonnes: bigint) => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const encrypted = await encryptUint64(pc, wc, tonnes, fhe.setLabel);
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "submitEmissions",
          args: [facilityId, encrypted as never],
          gas: GAS.submitEmissions,
          ...fees,
        });
        fhe.setStep("READY");
        return hash;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync],
  );

  const aggregateTotal = useCallback(
    async (company: `0x${string}`) => {
      const { publicClient: pc } = ensureClients();
      const facilityCount = BigInt(
        (facilityIds.data as readonly bigint[] | undefined)?.length ?? 1,
      );
      const gas = GAS.aggregateBase + GAS.aggregatePerFacility * facilityCount;
      const fees = await getGasFees(pc);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "aggregateTotal",
        args: [company],
        gas,
        ...fees,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync, facilityIds.data],
  );

  const setCap = useCallback(
    async (company: `0x${string}`, tonnes: bigint) => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const encrypted = await encryptUint64(pc, wc, tonnes, fhe.setLabel);
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "setCap",
          args: [company, encrypted as never],
          gas: GAS.setCap,
          ...fees,
        });
        fhe.setStep("READY");
        return hash;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync],
  );

  const grantCheckAccess = useCallback(
    async (company: `0x${string}`) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "grantCheckAccess",
        args: [company, CAP_CHECK_ADDRESS],
        gas: GAS.grantCheckAccess,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const grantAuditAccess = useCallback(
    async (auditor: `0x${string}`, durationSeconds: bigint) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "grantAuditAccessToTotal",
        args: [auditor, durationSeconds],
        gas: GAS.grantAuditAccess,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const revokeAuditAccess = useCallback(
    async (auditor: `0x${string}`) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "revokeAuditAccess",
        args: [auditor],
        gas: GAS.revokeAuditAccess,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const checkCompliance = useCallback(
    async (company: `0x${string}`) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_CHECK_ADDRESS,
        abi: CAP_CHECK_ABI,
        functionName: "checkCompliance",
        args: [company],
        gas: GAS.checkCompliance,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const settleCompliance = useCallback(
    async (company: `0x${string}`) => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      const handle = (complianceHandle.data ?? 0n) as bigint;
      if (!handle)
        throw new Error("No compliance result yet — run a check first.");
      try {
        fhe.setStep("ENCRYPTING");
        const { decryptedValue, signature } = await decryptForSettlement(
          pc,
          wc,
          handle,
          fhe.setLabel,
        );
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_CHECK_ADDRESS,
          abi: CAP_CHECK_ABI,
          functionName: "settleCompliance",
          args: [company, decryptedValue as boolean, signature],
          gas: GAS.settleCompliance,
          ...fees,
        });
        fhe.setStep("READY");
        return hash;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync, complianceHandle.data],
  );

  // ─── Decrypt helpers ───────────────────────────────────────────────

  const decryptHandleU64 = useCallback(
    async (handle: bigint): Promise<bigint> => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      try {
        fhe.setStep("COMPUTING");
        const value = await decryptUint64(pc, wc, handle, fhe.setLabel);
        fhe.setStep("READY");
        return value;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient],
  );

  const decryptHandleBool = useCallback(
    async (handle: bigint): Promise<boolean> => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      try {
        fhe.setStep("COMPUTING");
        const value = await decryptBool(pc, wc, handle, fhe.setLabel);
        fhe.setStep("READY");
        return value;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient],
  );

  /**
   * Decrypt a single facility's encrypted emissions.
   * `getMyEmissions` uses `msg.sender` — `account: address` is required, else
   * the eth_call has `from = 0x0` and reverts.
   */
  const decryptFacility = useCallback(
    async (facilityId: bigint): Promise<bigint> => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      if (!address) throw new Error("Wallet not connected");
      try {
        fhe.setStep("COMPUTING");
        fhe.setLabel("Reading encrypted handle");
        const handle = (await pc.readContract({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "getMyEmissions",
          args: [facilityId],
          account: address,
        })) as unknown as bigint;
        if (!handle) throw new Error("Facility has no encrypted handle yet.");
        const value = await decryptUint64(pc, wc, handle, fhe.setLabel);
        fhe.setStep("READY");
        return value;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, address],
  );

  return {
    // state
    address,
    fheReady: !!walletClient && !!publicClient,
    isOwner:
      !!owner.data &&
      !!address &&
      (owner.data as string).toLowerCase() === address.toLowerCase(),
    role: (myRole.data ?? 0) as number,
    facilityIds: (facilityIds.data ?? []) as readonly bigint[],
    companyTotalHandle: (companyTotalHandle.data ?? 0n) as bigint,
    hasAggregated: !!(companyTotalHandle.data as bigint | undefined),
    regulatoryCapHandle: (regulatoryCapHandle.data ?? 0n) as bigint,
    hasCapSet: !!(regulatoryCapHandle.data as bigint | undefined),
    complianceHandle: (complianceHandle.data ?? 0n) as bigint,
    settled: settledStatus.data as readonly [boolean, boolean] | undefined,
    lastCheckedAt: (lastCheckedAt.data ?? 0n) as bigint,
    // FHE step state
    fheStep: fhe.step,
    fheStepLabel: fhe.stepLabel,
    fheStepIndex: fhe.stepIndex,
    fheError: fhe.errorMessage,
    fheWorking: fhe.isWorking,
    resetFheStatus: fhe.reset,
    // refetchers
    refetch: () => {
      myRole.refetch();
      facilityIds.refetch();
      companyTotalHandle.refetch();
      regulatoryCapHandle.refetch();
      complianceHandle.refetch();
      settledStatus.refetch();
      lastCheckedAt.refetch();
    },
    // actions
    registerAsEmitter,
    submitEmissions,
    aggregateTotal,
    setCap,
    grantCheckAccess,
    grantAuditAccess,
    revokeAuditAccess,
    checkCompliance,
    settleCompliance,
    // decrypts
    decryptUint64: decryptHandleU64,
    decryptBool: decryptHandleBool,
    decryptFacility,
  };
}

export { useWaitForTransactionReceipt };
