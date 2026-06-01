import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";
const TARGET = "0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3";
const ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";

task("covertmrv:audit", "On-chain production audit for a user wallet")
  .addOptionalParam("company", "Company wallet to audit", TARGET)
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const { ethers, network } = hre;
    const company = args.company as string;
    if (!ethers.isAddress(company)) throw new Error(`Invalid company: ${company}`);

    const deployments = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "deployments.json"), "utf8"),
    );
    const entry = deployments[network.name];
    if (!entry) throw new Error(`No deployment for ${network.name}`);

    const registry = await ethers.getContractAt("CapRegistry", entry.capRegistry);
    const capCheck = await ethers.getContractAt("CapCheck", entry.capCheck);
    const cert = await ethers.getContractAt("ComplianceCertificate", entry.complianceCertificate);
    const creditIssuer = await ethers.getContractAt("CreditIssuer", entry.creditIssuer);

    const role = await registry.roleOf(company);
    const facilityCount = await registry.getFacilityCount(company);
    let totalHandle = await registry.getCompanyTotal(company);
    let capHandle = await registry.getRegulatoryCap(company);
    const compliance = await capCheck.complianceResults(company);
    const settled = await capCheck.isSettled(company);
    const certCapCheck = await cert.capCheck();
    const checkCert = await capCheck.certificate();
    const checkIssuer = await capCheck.creditIssuer();
    const issuerCapCheck = await creditIssuer.capCheck();

    const isZero = (h: string) => {
      try {
        return h === ZERO || BigInt(h) === 0n;
      } catch {
        return true;
      }
    };

    console.log("\n=== CovertMRV production audit ===");
    console.log(`Network: ${network.name}`);
    console.log(`Company: ${company}\n`);

    console.log("--- Deployments ---");
    for (const [k, v] of Object.entries(entry)) {
      if (typeof v === "string" && v.startsWith("0x")) console.log(`  ${k}: ${v}`);
    }

    console.log("\n--- Wiring ---");
    const wiring = [
      ["cert.capCheck", certCapCheck, entry.capCheck],
      ["capCheck.certificate", checkCert, entry.complianceCertificate],
      ["capCheck.creditIssuer", checkIssuer, entry.creditIssuer],
      ["creditIssuer.capCheck", issuerCapCheck, entry.capCheck],
    ] as const;
    for (const [label, got, want] of wiring) {
      const ok = String(got).toLowerCase() === String(want).toLowerCase();
      console.log(`  ${ok ? "PASS" : "FAIL"} ${label}: ${got} ${ok ? "" : `(expected ${want})`}`);
    }

    console.log("\n--- User onboarding state ---");
    const roleN = BigInt(role);
    console.log(`  role: ${role} (${roleN === 1n ? "EMITTER" : roleN === 0n ? "NONE" : "OTHER"})`);
    console.log(`  facilityCount: ${facilityCount}`);
    console.log(`  companyTotal handle: ${isZero(totalHandle) ? "ZERO (not aggregated)" : totalHandle}`);
    console.log(`  regulatoryCap handle: ${isZero(capHandle) ? "ZERO (admin setCap needed)" : capHandle}`);
    console.log(`  compliance.exists: ${compliance.exists}`);
    console.log(`  compliance.encryptedResult: ${isZero(compliance.encryptedResult) ? "ZERO" : compliance.encryptedResult}`);
    console.log(`  compliance.settled: ${compliance.settled}`);
    console.log(`  isSettled public: ${settled[0]} result=${settled[1]}`);

    console.log("\n--- Blockers for full flow ---");
    const blockers: string[] = [];
    if (roleN === 0n) blockers.push("Register emitter (registerAsEmitter)");
    if (BigInt(facilityCount) === 0n) blockers.push("Submit at least one facility emissions");
    if (isZero(totalHandle)) blockers.push("Run aggregateTotal (manual — user must confirm wallet)");
    if (isZero(capHandle)) blockers.push("Admin setCap for this address");
    if (!compliance.exists) blockers.push("Run checkCompliance");
    if (compliance.exists && isZero(compliance.encryptedResult))
      blockers.push("Compliance record exists but handle zero — wrong CapCheck env?");
    if (blockers.length === 0) blockers.push("None — user can decrypt if ACL + permit OK");
    blockers.forEach((b) => console.log(`  • ${b}`));
    console.log("");
  });
