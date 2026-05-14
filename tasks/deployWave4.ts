import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

task(
  "deploy:wave4",
  "Deploy Wave 4: SupplierAttest + ProductFootprint + cCO2 + CreditIssuer + CreditRetire, " +
    "redeploy CapRegistry + CapCheck + ComplianceCertificate with privacy fixes, " +
    "wire all contracts, and write addresses + ABIs to the frontend"
).setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const { ethers, network } = hre;

  console.log(`\n▶ Deploying CovertMRV Wave 4 (ScopeX) to ${network.name}...`);
  const [deployer] = await ethers.getSigners();
  console.log(`  deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`  balance:  ${ethers.formatEther(balance)} ETH\n`);

  // ─── Phase A: Privacy-fixed core contracts ───────────────────────────

  // A1. CapRegistry (privacy-fixed: encrypted scope, private mappings)
  const Registry = await ethers.getContractFactory("CapRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✓ CapRegistry (privacy-fixed)  → ${registryAddress}`);

  // A2. CapCheck (points to new CapRegistry)
  const Check = await ethers.getContractFactory("CapCheck");
  const check = await Check.deploy(registryAddress);
  await check.waitForDeployment();
  const checkAddress = await check.getAddress();
  console.log(`✓ CapCheck                     → ${checkAddress}`);

  // A3. ComplianceCertificate (unchanged logic, redeployed for new CapCheck)
  const Cert = await ethers.getContractFactory("ComplianceCertificate");
  const cert = await Cert.deploy();
  await cert.waitForDeployment();
  const certAddress = await cert.getAddress();
  console.log(`✓ ComplianceCertificate        → ${certAddress}`);

  // Wire: cert ↔ check
  await (await cert.setCapCheck(checkAddress)).wait();
  await (await check.setCertificate(certAddress)).wait();
  console.log(`✓ Wired: cert.setCapCheck + check.setCertificate`);

  // ─── Phase B: Supply chain contracts ────────────────────────────────

  // B1. SupplierAttest
  const SupplierAttest = await ethers.getContractFactory("SupplierAttest");
  const supplierAttest = await SupplierAttest.deploy();
  await supplierAttest.waitForDeployment();
  const supplierAttestAddress = await supplierAttest.getAddress();
  console.log(`✓ SupplierAttest               → ${supplierAttestAddress}`);

  // B2. ProductFootprint (needs SupplierAttest)
  const ProductFootprint = await ethers.getContractFactory("ProductFootprint");
  const productFootprint = await ProductFootprint.deploy(supplierAttestAddress);
  await productFootprint.waitForDeployment();
  const productFootprintAddress = await productFootprint.getAddress();
  console.log(`✓ ProductFootprint             → ${productFootprintAddress}`);

  // ─── Phase C: Carbon credit contracts ───────────────────────────────

  // C1. cCO2 FHERC20
  const CcCO2 = await ethers.getContractFactory("cCO2");
  const cco2 = await CcCO2.deploy();
  await cco2.waitForDeployment();
  const cco2Address = await cco2.getAddress();
  console.log(`✓ cCO2 (FHERC20)               → ${cco2Address}`);

  // C2. CreditIssuer (needs CapCheck + cCO2)
  const CreditIssuer = await ethers.getContractFactory("CreditIssuer");
  const creditIssuer = await CreditIssuer.deploy(checkAddress, cco2Address);
  await creditIssuer.waitForDeployment();
  const creditIssuerAddress = await creditIssuer.getAddress();
  console.log(`✓ CreditIssuer                 → ${creditIssuerAddress}`);

  // C3. CreditRetire (needs cCO2)
  const CreditRetire = await ethers.getContractFactory("CreditRetire");
  const creditRetire = await CreditRetire.deploy(cco2Address);
  await creditRetire.waitForDeployment();
  const creditRetireAddress = await creditRetire.getAddress();
  console.log(`✓ CreditRetire                 → ${creditRetireAddress}`);

  // ─── Wiring ─────────────────────────────────────────────────────────

  // cCO2 role assignments
  await (await cco2.setIssuer(creditIssuerAddress)).wait();
  await (await cco2.setRetirer(creditRetireAddress)).wait();
  console.log(`✓ cCO2.setIssuer(CreditIssuer) + cCO2.setRetirer(CreditRetire)`);

  // CapCheck knows about CreditIssuer so it can FHE.allow on checkCompliance
  await (await check.setCreditIssuer(creditIssuerAddress)).wait();
  console.log(`✓ CapCheck.setCreditIssuer(CreditIssuer)`);

  // ─── Write artifacts ─────────────────────────────────────────────────

  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  const registryArtifact = await hre.artifacts.readArtifact("CapRegistry");
  const checkArtifact = await hre.artifacts.readArtifact("CapCheck");
  const certArtifact = await hre.artifacts.readArtifact("ComplianceCertificate");
  const supplierAttestArtifact = await hre.artifacts.readArtifact("SupplierAttest");
  const productFootprintArtifact = await hre.artifacts.readArtifact("ProductFootprint");
  const cco2Artifact = await hre.artifacts.readArtifact("cCO2");
  const creditIssuerArtifact = await hre.artifacts.readArtifact("CreditIssuer");
  const creditRetireArtifact = await hre.artifacts.readArtifact("CreditRetire");

  const frontendConfig = path.resolve(
    __dirname,
    "..",
    "frontend",
    "src",
    "config",
    "contracts.ts"
  );
  fs.mkdirSync(path.dirname(frontendConfig), { recursive: true });

  const fileBody = `// AUTOGENERATED by tasks/deployWave4.ts — do not edit by hand.
// Run \`npx hardhat deploy:wave4 --network arb-sepolia\` from the repo root to regenerate.

export const CHAIN_ID = ${chainId};

// ─── Core (redeployed with Wave 4 privacy fixes) ─────────────────────────────

export const CAP_REGISTRY_ADDRESS =
  (import.meta.env.VITE_CAP_REGISTRY_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${registryAddress}" as \`0x\${string}\`);

export const CAP_CHECK_ADDRESS =
  (import.meta.env.VITE_CAP_CHECK_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${checkAddress}" as \`0x\${string}\`);

export const COMPLIANCE_CERTIFICATE_ADDRESS =
  (import.meta.env.VITE_COMPLIANCE_CERTIFICATE_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${certAddress}" as \`0x\${string}\`);

// ─── Supply chain (new in Wave 4) ────────────────────────────────────────────

export const SUPPLIER_ATTEST_ADDRESS =
  (import.meta.env.VITE_SUPPLIER_ATTEST_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${supplierAttestAddress}" as \`0x\${string}\`);

export const PRODUCT_FOOTPRINT_ADDRESS =
  (import.meta.env.VITE_PRODUCT_FOOTPRINT_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${productFootprintAddress}" as \`0x\${string}\`);

// ─── Carbon credits (new in Wave 4) ──────────────────────────────────────────

export const CCO2_ADDRESS =
  (import.meta.env.VITE_CCO2_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${cco2Address}" as \`0x\${string}\`);

export const CREDIT_ISSUER_ADDRESS =
  (import.meta.env.VITE_CREDIT_ISSUER_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${creditIssuerAddress}" as \`0x\${string}\`);

export const CREDIT_RETIRE_ADDRESS =
  (import.meta.env.VITE_CREDIT_RETIRE_ADDRESS as \`0x\${string}\` | undefined) ??
  ("${creditRetireAddress}" as \`0x\${string}\`);

// ─── ABIs ─────────────────────────────────────────────────────────────────────

export const CAP_REGISTRY_ABI = ${JSON.stringify(registryArtifact.abi, null, 2)} as const;
export const CAP_CHECK_ABI = ${JSON.stringify(checkArtifact.abi, null, 2)} as const;
export const COMPLIANCE_CERTIFICATE_ABI = ${JSON.stringify(certArtifact.abi, null, 2)} as const;
export const SUPPLIER_ATTEST_ABI = ${JSON.stringify(supplierAttestArtifact.abi, null, 2)} as const;
export const PRODUCT_FOOTPRINT_ABI = ${JSON.stringify(productFootprintArtifact.abi, null, 2)} as const;
export const CCO2_ABI = ${JSON.stringify(cco2Artifact.abi, null, 2)} as const;
export const CREDIT_ISSUER_ABI = ${JSON.stringify(creditIssuerArtifact.abi, null, 2)} as const;
export const CREDIT_RETIRE_ABI = ${JSON.stringify(creditRetireArtifact.abi, null, 2)} as const;
`;
  fs.writeFileSync(frontendConfig, fileBody);
  console.log(`\n✓ Wrote ${path.relative(process.cwd(), frontendConfig)}`);

  // Update deployments.json
  const deploymentsPath = path.resolve(__dirname, "..", "deployments.json");
  let history: Record<string, unknown> = {};
  if (fs.existsSync(deploymentsPath)) {
    try {
      history = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    } catch {
      history = {};
    }
  }
  history[network.name] = {
    chainId,
    wave: 4,
    deployer: deployer.address,
    capRegistry: registryAddress,
    capCheck: checkAddress,
    complianceCertificate: certAddress,
    supplierAttest: supplierAttestAddress,
    productFootprint: productFootprintAddress,
    cco2: cco2Address,
    creditIssuer: creditIssuerAddress,
    creditRetire: creditRetireAddress,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(deploymentsPath, JSON.stringify(history, null, 2));
  console.log(`✓ Updated deployments.json`);

  console.log(`\n✅ Wave 4 (ScopeX) deployment complete!`);
  console.log(`   CapRegistry:           ${registryAddress}`);
  console.log(`   CapCheck:              ${checkAddress}`);
  console.log(`   ComplianceCertificate: ${certAddress}`);
  console.log(`   SupplierAttest:        ${supplierAttestAddress}`);
  console.log(`   ProductFootprint:      ${productFootprintAddress}`);
  console.log(`   cCO2:                  ${cco2Address}`);
  console.log(`   CreditIssuer:          ${creditIssuerAddress}`);
  console.log(`   CreditRetire:          ${creditRetireAddress}`);
  console.log(`\nNext steps:`);
  console.log(`  1. npx hardhat covertmrv:set-cap --network ${network.name} --company <addr> --cap 50000`);
  console.log(`  2. npx hardhat covertmrv:grant-role --network ${network.name} --account <addr> --role 1`);
  console.log(`  3. cd frontend && bun run build`);
});
