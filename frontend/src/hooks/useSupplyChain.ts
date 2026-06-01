import { useCallback } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { keccak256, stringToBytes, type Address } from "viem";
import {
  SUPPLIER_ATTEST_ABI,
  SUPPLIER_ATTEST_ADDRESS,
  PRODUCT_FOOTPRINT_ABI,
  PRODUCT_FOOTPRINT_ADDRESS,
} from "@/config/contracts";
import { getGasFees } from "@/lib/gas";
import { decryptUint64, decryptBool, describeFheError, encryptUint64 } from "@/lib/fhe";
import { useWalletClient } from "wagmi";
import { useFHEStatus } from "./useFHEStatus";
import { isInitializedCtHandle, parseCtHandle } from "@/lib/ct-handle";

const GAS = {
  submitFactor: 700_000n,
  computeFootprint: 1_000_000n,
  classifyBand: 1_200_000n,
  checkThreshold: 1_200_000n,
} as const;

function skuHash(sku: string): `0x${string}` {
  return keccak256(stringToBytes(sku));
}

export function useSupplyChain() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const fhe = useFHEStatus();

  const myRole = useReadContract({
    address: SUPPLIER_ATTEST_ADDRESS,
    abi: SUPPLIER_ATTEST_ABI,
    functionName: "roleOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
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
      address: SUPPLIER_ATTEST_ADDRESS,
      abi: SUPPLIER_ATTEST_ABI,
      functionName: "registerAsEmitter",
      gas: 150_000n,
      ...fees,
    });
  }, [publicClient, writeContractAsync]);

  const submitFactor = useCallback(
    async (sku: string, factorTonnes: bigint, year: number) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const encrypted = await encryptUint64(pc, wc, acct, factorTonnes, fhe.setLabel);
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: SUPPLIER_ATTEST_ADDRESS,
          abi: SUPPLIER_ATTEST_ABI,
          functionName: "submitFactor",
          args: [skuHash(sku), encrypted as never, BigInt(year)],
          gas: GAS.submitFactor,
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

  const computeFootprint = useCallback(
    async (sku: string, suppliers: Address[]) => {
      const fees = await getGasFees(publicClient);
      const hash = await writeContractAsync({
        address: PRODUCT_FOOTPRINT_ADDRESS,
        abi: PRODUCT_FOOTPRINT_ABI,
        functionName: "computeFootprint",
        args: [skuHash(sku), suppliers],
        gas: GAS.computeFootprint + BigInt(suppliers.length) * 300_000n,
        ...fees,
      });
      return hash;
    },
    [publicClient, writeContractAsync],
  );

  const classifyBand = useCallback(
    async (sku: string, suppliers: Address[]) => {
      const fees = await getGasFees(publicClient);
      return writeContractAsync({
        address: PRODUCT_FOOTPRINT_ADDRESS,
        abi: PRODUCT_FOOTPRINT_ABI,
        functionName: "classifyBand",
        args: [skuHash(sku), suppliers],
        gas: GAS.classifyBand + BigInt(suppliers.length) * 300_000n,
        ...fees,
      });
    },
    [publicClient, writeContractAsync],
  );

  const checkThreshold = useCallback(
    async (sku: string, suppliers: Address[], thresholdTonnes: bigint) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      try {
        fhe.setStep("ENCRYPTING");
        const encThreshold = await encryptUint64(pc, wc, acct, thresholdTonnes, fhe.setLabel);
        fhe.setStep("COMPUTING");
        const fees = await getGasFees(pc);
        const hash = await writeContractAsync({
          address: PRODUCT_FOOTPRINT_ADDRESS,
          abi: PRODUCT_FOOTPRINT_ABI,
          functionName: "checkThreshold",
          args: [skuHash(sku), suppliers, encThreshold as never],
          gas: GAS.checkThreshold + BigInt(suppliers.length) * 300_000n,
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

  const readStoredFootprint = useCallback(
    async (sku: string, requester?: Address) => {
      if (!publicClient) throw new Error("No public client");
      const who = requester ?? address;
      if (!who) throw new Error("Wallet not connected");
      const raw = await publicClient.readContract({
        address: PRODUCT_FOOTPRINT_ADDRESS,
        abi: PRODUCT_FOOTPRINT_ABI,
        functionName: "getFootprintResult",
        args: [who, skuHash(sku)],
      });
      return parseCtHandle(raw);
    },
    [publicClient, address],
  );

  const readStoredThreshold = useCallback(
    async (sku: string, requester?: Address) => {
      if (!publicClient) throw new Error("No public client");
      const who = requester ?? address;
      if (!who) throw new Error("Wallet not connected");
      const raw = await publicClient.readContract({
        address: PRODUCT_FOOTPRINT_ADDRESS,
        abi: PRODUCT_FOOTPRINT_ABI,
        functionName: "getThresholdResult",
        args: [who, skuHash(sku)],
      });
      return parseCtHandle(raw);
    },
    [publicClient, address],
  );

  const decryptHandle = useCallback(
    async (handle: bigint) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      if (!isInitializedCtHandle(handle)) throw new Error("No stored result handle — run compute first.");
      fhe.setStep("COMPUTING");
      const value = await decryptUint64(pc, wc, acct, handle, fhe.setLabel);
      fhe.setStep("READY");
      return value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient],
  );

  const decryptBoolHandle = useCallback(
    async (handle: bigint) => {
      const { publicClient: pc, walletClient: wc, address: acct } = ensureClients();
      if (!isInitializedCtHandle(handle)) throw new Error("No stored result handle — run check first.");
      fhe.setStep("COMPUTING");
      const value = await decryptBool(pc, wc, acct, handle, fhe.setLabel);
      fhe.setStep("READY");
      return value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicClient, walletClient],
  );

  return {
    address,
    role: (myRole.data ?? 0) as number,
    refetchRole: myRole.refetch,
    fheStep: fhe.step,
    fheStepLabel: fhe.stepLabel,
    fheError: fhe.errorMessage,
    fheWorking: fhe.isWorking,
    registerAsEmitter,
    submitFactor,
    computeFootprint,
    classifyBand,
    checkThreshold,
    readStoredFootprint,
    readStoredThreshold,
    decryptHandle,
    decryptBoolHandle,
    skuHash,
  };
}
