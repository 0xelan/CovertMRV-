// frontend/src/hooks/useCovertMrv.ts

import { useCallback, useEffect, useMemo, useState } from "react";
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
  COMPLIANCE_CERTIFICATE_ABI,
  COMPLIANCE_CERTIFICATE_ADDRESS,
} from "@/config/contracts";
import { getGasFees } from "@/lib/gas";
import {
  decryptBool,
  decryptForSettlement,
  decryptUint64,
  describeFheError,
  encryptBatchEmissions,
  encryptEmissionSubmission,
  encryptUint64,
} from "@/lib/fhe";
import {
  loadSubmittedFacilityIds,
  recordSubmittedFacilityIds,
} from "@/lib/submitted-facilities";
import { useFHEStatus } from "./useFHEStatus";
import { isInitializedCtHandle, parseCtHandle } from "@/lib/ct-handle";

const GAS = {
  registerAsEmitter: 150_000n,
  submitEmissions: 800_000n,
  batchSubmitEmissions: 1_200_000n,
  aggregateBase: 400_000n,
  aggregatePerFacility: 250_000n,
  setCap: 600_000n,
  grantCheckAccess: 300_000n,
  grantAuditAccess: 300_000n,
  revokeAuditAccess: 200_000n,
  checkCompliance: 900_000n,
  settleCompliance: 600_000n,
} as const;

export function useCovertMrv(reportingYear: number = new Date().getFullYear()) {
  const yearBig = BigInt(reportingYear);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const fhe = useFHEStatus();

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

  const facilityCountRead = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getFacilityCount",
    args: address ? [address, yearBig] : undefined,
    account: address,
    query: { enabled: !!address },
  });

  const [trackedFacilityIds, setTrackedFacilityIds] = useState<readonly bigint[]>([]);

  useEffect(() => {
    if (!address) {
      setTrackedFacilityIds([]);
      return;
    }
    setTrackedFacilityIds(loadSubmittedFacilityIds(address));
  }, [address]);

  useEffect(() => {
    if (!publicClient || !address) return;
    const chainCount = Number(facilityCountRead.data ?? 0n);
    if (chainCount === 0) return;
    if (trackedFacilityIds.length >= chainCount) return;

    let cancelled = false;
    (async () => {
      const found: bigint[] = [...trackedFacilityIds];
      for (let i = 1n; i <= 64n; i++) {
        if (found.length >= chainCount) break;
        if (found.some((id) => id === i)) continue;
        try {
          const submitted = await publicClient.readContract({
            address: CAP_REGISTRY_ADDRESS,
            abi: CAP_REGISTRY_ABI,
            functionName: "isFacilitySubmitted",
            args: [address, yearBig, i],
          });
          if (submitted) found.push(i);
        } catch {
          /* ignore scan errors */
        }
      }
      if (cancelled || found.length === 0) return;
      found.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
      recordSubmittedFacilityIds(address, found);
      setTrackedFacilityIds(found);
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, address, facilityCountRead.data, trackedFacilityIds.length, yearBig]);

  const companyTotalHandle = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getCompanyTotal",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const complianceHandle = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "getComplianceResult",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const complianceRecord = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "complianceResults",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const regulatoryCapHandle = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "getRegulatoryCap",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const settledStatus = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "isSettled",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const lastCheckedAt = useReadContract({
    address: CAP_CHECK_ADDRESS,
    abi: CAP_CHECK_ABI,
    functionName: "lastCheckedAt",
    args: address ? [address, yearBig] : undefined,
    query: { enabled: !!address },
  });

  const auditGrant = useReadContract({
    address: CAP_REGISTRY_ADDRESS,
    abi: CAP_REGISTRY_ABI,
    functionName: "auditGrants",
    args: undefined,
    query: { enabled: false },
  });

  const certificateBalance = useReadContract({
    address: COMPLIANCE_CERTIFICATE_ADDRESS || undefined,
    abi: COMPLIANCE_CERTIFICATE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!COMPLIANCE_CERTIFICATE_ADDRESS },
  });

  function ensureClients() {
    if (!publicClient || !walletClient || !address) {
      throw new Error("Wallet not connected");
    }
    return { publicClient, walletClient, address };
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

  const submitEmissions = useCallback(
    async (facilityId: bigint, tonnes: bigint, year: number, scope: number = 0) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const { encEmissions, encScope } = await encryptEmissionSubmission(
          pc,
          wc,
          acct,
          tonnes,
          scope,
          fhe.setLabel,
        );
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "submitEmissions",
          args: [facilityId, encEmissions as never, encScope as never, BigInt(year)],
          gas: GAS.submitEmissions,
          ...fees,
        });
        fhe.setStep("READY");
        if (address) {
          const updated = recordSubmittedFacilityIds(address, [facilityId]);
          setTrackedFacilityIds(updated);
        }
        return hash;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync, address],
  );

  const batchSubmitEmissions = useCallback(
    async (facilityIds_: bigint[], tonnesArr: bigint[], year: number, scope: number = 0) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const scopes = tonnesArr.map(() => scope);
        const { encEmissions, encScopes } = await encryptBatchEmissions(
          pc,
          wc,
          acct,
          tonnesArr,
          scopes,
          fhe.setLabel,
        );
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "batchSubmitEmissions",
          args: [facilityIds_, encEmissions as never, encScopes as never, BigInt(year)],
          gas: GAS.batchSubmitEmissions,
          ...fees,
        });
        fhe.setStep("READY");
        if (address) {
          const updated = recordSubmittedFacilityIds(address, facilityIds_);
          setTrackedFacilityIds(updated);
        }
        return hash;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, writeContractAsync, address],
  );

  const aggregateTotal = useCallback(
    async (company: `0x${string}`, year: number = reportingYear) => {
      const { publicClient: pc } = ensureClients();
      const facilityCount = BigInt(
        Number(facilityCountRead.data ?? 0n) || trackedFacilityIds.length || 1,
      );
      const gas = GAS.aggregateBase + GAS.aggregatePerFacility * facilityCount;
      const fees = await getGasFees(pc);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "aggregateTotal",
        args: [company, BigInt(year)],
        gas,
        ...fees,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      publicClient,
      walletClient,
      writeContractAsync,
      facilityCountRead.data,
      trackedFacilityIds.length,
      reportingYear,
    ],
  );

  const setCap = useCallback(
    async (company: `0x${string}`, tonnes: bigint, year: number = reportingYear) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const encrypted = await encryptUint64(pc, wc, acct, tonnes, fhe.setLabel);
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "setCap",
          args: [company, BigInt(year), encrypted as never],
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
    [publicClient, walletClient, writeContractAsync, reportingYear],
  );

  const grantCheckAccess = useCallback(
    async (company: `0x${string}`, year: number = reportingYear) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "grantCheckAccess",
        args: [company, BigInt(year), CAP_CHECK_ADDRESS],
        gas: GAS.grantCheckAccess,
        ...fees,
      });
    },
    [publicClient, writeContractAsync, reportingYear],
  );

  const grantAuditAccess = useCallback(
    async (auditor: `0x${string}`, durationSeconds: bigint, year: number = reportingYear) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "grantAuditAccessToTotal",
        args: [auditor, BigInt(year), durationSeconds],
        gas: GAS.grantAuditAccess,
        ...fees,
      });
    },
    [publicClient, writeContractAsync, reportingYear],
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

  const checkAuditActive = useCallback(
    async (company: `0x${string}`, auditor: `0x${string}`) => {
      if (!publicClient) throw new Error("No public client");
      return publicClient.readContract({
        address: CAP_REGISTRY_ADDRESS,
        abi: CAP_REGISTRY_ABI,
        functionName: "isAuditActive",
        args: [company, auditor],
      }) as Promise<boolean>;
    },
    [publicClient],
  );

  const checkCompliance = useCallback(
    async (company: `0x${string}`, year: number) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: CAP_CHECK_ADDRESS,
        abi: CAP_CHECK_ABI,
        functionName: "checkCompliance",
        args: [company, BigInt(year)],
        gas: GAS.checkCompliance,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const settleCompliance = useCallback(
    async (company: `0x${string}`, year: number = reportingYear) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      if (!owner.data || (owner.data as string).toLowerCase() !== acct.toLowerCase()) {
        throw new Error("Regulator settlement requires the contract owner wallet.");
      }
      const rawHandle = await pc.readContract({
        address: CAP_CHECK_ADDRESS,
        abi: CAP_CHECK_ABI,
        functionName: "getComplianceResult",
        args: [company, BigInt(year)],
      });
      const handle = parseCtHandle(rawHandle);
      if (!isInitializedCtHandle(handle)) {
        throw new Error(
          `No compliance result for ${company} in ${year} — run checkCompliance first.`,
        );
      }
      try {
        fhe.setStep("ENCRYPTING");
        const { decryptedValue, signature } = await decryptForSettlement(
          pc,
          wc,
          acct,
          handle,
          fhe.setLabel,
        );
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: CAP_CHECK_ADDRESS,
          abi: CAP_CHECK_ABI,
          functionName: "settleCompliance",
          args: [company, BigInt(year), decryptedValue as boolean, signature],
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
    [publicClient, walletClient, writeContractAsync, owner.data, reportingYear],
  );

  const readCompanyPeriod = useCallback(
    async (company: `0x${string}`, year: number) => {
      if (!publicClient) throw new Error("No public client");
      const y = BigInt(year);
      const [total, cap, compliance] = await Promise.all([
        publicClient.readContract({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "getCompanyTotal",
          args: [company, y],
        }),
        publicClient.readContract({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "getRegulatoryCap",
          args: [company, y],
        }),
        publicClient.readContract({
          address: CAP_CHECK_ADDRESS,
          abi: CAP_CHECK_ABI,
          functionName: "complianceResults",
          args: [company, y],
        }),
      ]);
      return {
        totalHandle: parseCtHandle(total),
        capHandle: parseCtHandle(cap),
        compliance: compliance as {
          exists: boolean;
          settled: boolean;
          encryptedResult: bigint;
        },
      };
    },
    [publicClient],
  );

  const decryptHandleU64 = useCallback(
    async (handle: bigint): Promise<bigint> => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("COMPUTING");
        const value = await decryptUint64(pc, wc, acct, handle, fhe.setLabel);
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

  const decryptHandleBool = useCallback(
    async (handle: bigint): Promise<boolean> => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("COMPUTING");
        const value = await decryptBool(pc, wc, acct, handle, fhe.setLabel);
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

  const decryptFacility = useCallback(
    async (facilityId: bigint, year: number = reportingYear): Promise<bigint> => {
      const { publicClient: pc, walletClient: wc } = ensureClients();
      if (!address) throw new Error("Wallet not connected");
      try {
        fhe.setStep("COMPUTING");
        fhe.setLabel("Reading encrypted handle");
        const handle = (await pc.readContract({
          address: CAP_REGISTRY_ADDRESS,
          abi: CAP_REGISTRY_ABI,
          functionName: "getMyEmissions",
          args: [facilityId, BigInt(year)],
          account: address,
        })) as unknown as bigint;
        if (!handle) throw new Error("Facility has no encrypted handle yet.");
        const value = await decryptUint64(pc, wc, address, handle, fhe.setLabel);
        fhe.setStep("READY");
        return value;
      } catch (err) {
        fhe.setStep("ERROR", describeFheError(err));
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient, address, reportingYear],
  );

  const refetchAll = useCallback(() => {
    void myRole.refetch();
    void facilityCountRead.refetch();
    void companyTotalHandle.refetch();
    void regulatoryCapHandle.refetch();
    void complianceHandle.refetch();
    void complianceRecord.refetch();
    void settledStatus.refetch();
    void lastCheckedAt.refetch();
    void auditGrant.refetch();
    void certificateBalance.refetch();
  }, [
    myRole,
    facilityCountRead,
    companyTotalHandle,
    regulatoryCapHandle,
    complianceHandle,
    complianceRecord,
    settledStatus,
    lastCheckedAt,
    auditGrant,
    certificateBalance,
  ]);

  return {
    reportingYear,
    address,
    fheReady: !!walletClient && !!publicClient,
    isOwner:
      !!owner.data &&
      !!address &&
      (owner.data as string).toLowerCase() === address.toLowerCase(),
    role: (myRole.data ?? 0) as number,
    facilityCount: Number(facilityCountRead.data ?? 0n),
    facilityIds: trackedFacilityIds,
    companyTotalHandle: parseCtHandle(companyTotalHandle.data),
    hasAggregated:
      companyTotalHandle.isSuccess && isInitializedCtHandle(companyTotalHandle.data),
    regulatoryCapHandle: parseCtHandle(regulatoryCapHandle.data),
    hasCapSet:
      regulatoryCapHandle.isSuccess && isInitializedCtHandle(regulatoryCapHandle.data),
    complianceHandle: parseCtHandle(complianceHandle.data),
    complianceExists: Boolean(
      complianceRecord.data && (complianceRecord.data as { exists: boolean }).exists,
    ),
    hasComplianceResult:
      Boolean(complianceRecord.data && (complianceRecord.data as { exists: boolean }).exists) &&
      isInitializedCtHandle(complianceHandle.data),
    settled: settledStatus.data as readonly [boolean, boolean] | undefined,
    lastCheckedAt: (lastCheckedAt.data ?? 0n) as bigint,
    auditGrantExpiry: 0n,
    auditGrantActive: false,
    certificateBalance: (certificateBalance.data ?? 0n) as bigint,
    fheStep: fhe.step,
    fheStepLabel: fhe.stepLabel,
    fheStepIndex: fhe.stepIndex,
    fheError: fhe.errorMessage,
    fheWorking: fhe.isWorking,
    resetFheStatus: fhe.reset,
    refetch: refetchAll,
    registerAsEmitter,
    submitEmissions,
    batchSubmitEmissions,
    aggregateTotal,
    setCap,
    grantCheckAccess,
    grantAuditAccess,
    revokeAuditAccess,
    checkAuditActive,
    checkCompliance,
    settleCompliance,
    readCompanyPeriod,
    decryptUint64: decryptHandleU64,
    decryptBool: decryptHandleBool,
    decryptFacility,
  };
}

export { useWaitForTransactionReceipt };
