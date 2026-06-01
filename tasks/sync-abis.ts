import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

/** Regenerate frontend ABIs from compiled artifacts; preserve existing addresses. */
task("sync-abis", "Write frontend/src/config/contracts.ts ABIs without redeploying").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const frontendConfig = path.resolve(
      __dirname,
      "..",
      "frontend",
      "src",
      "config",
      "contracts.ts"
    );
    if (!fs.existsSync(frontendConfig)) {
      throw new Error(`Missing ${frontendConfig} — run deploy:full first`);
    }
    const existing = fs.readFileSync(frontendConfig, "utf8");
    const headerEnd = existing.indexOf("export const CAP_REGISTRY_ABI");
    if (headerEnd < 0) throw new Error("Could not find ABI section in contracts.ts");
    const header = existing.slice(0, headerEnd);

    const registryArtifact = await hre.artifacts.readArtifact("CapRegistry");
    const checkArtifact = await hre.artifacts.readArtifact("CapCheck");
    const certArtifact = await hre.artifacts.readArtifact("ComplianceCertificate");
    const supplierAttestArtifact = await hre.artifacts.readArtifact("SupplierAttest");
    const productFootprintArtifact = await hre.artifacts.readArtifact("ProductFootprint");
    const cco2Artifact = await hre.artifacts.readArtifact("cCO2");
    const creditIssuerArtifact = await hre.artifacts.readArtifact("CreditIssuer");
    const creditRetireArtifact = await hre.artifacts.readArtifact("CreditRetire");

    const body = `export const CAP_REGISTRY_ABI = ${JSON.stringify(registryArtifact.abi, null, 2)} as const;
export const CAP_CHECK_ABI = ${JSON.stringify(checkArtifact.abi, null, 2)} as const;
export const COMPLIANCE_CERTIFICATE_ABI = ${JSON.stringify(certArtifact.abi, null, 2)} as const;
export const SUPPLIER_ATTEST_ABI = ${JSON.stringify(supplierAttestArtifact.abi, null, 2)} as const;
export const PRODUCT_FOOTPRINT_ABI = ${JSON.stringify(productFootprintArtifact.abi, null, 2)} as const;
export const CCO2_ABI = ${JSON.stringify(cco2Artifact.abi, null, 2)} as const;
export const CREDIT_ISSUER_ABI = ${JSON.stringify(creditIssuerArtifact.abi, null, 2)} as const;
export const CREDIT_RETIRE_ABI = ${JSON.stringify(creditRetireArtifact.abi, null, 2)} as const;
`;
    fs.writeFileSync(frontendConfig, header + body);
    console.log(`✓ Updated ABIs in ${path.relative(process.cwd(), frontendConfig)}`);
  }
);
