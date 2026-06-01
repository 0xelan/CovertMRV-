import { task } from "hardhat/config";
import * as fs from "fs";
import * as path from "path";

task("verify:deployment", "Verify on-chain contract wiring from deployments.json").setAction(
  async (_, hre) => {
    const { ethers, network } = hre;
    const deployments = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "deployments.json"), "utf8"),
    );
    const d = deployments[network.name];
    if (!d) throw new Error(`No deployment for ${network.name}`);

    const check = await ethers.getContractAt("CapCheck", d.capCheck);
    const cert = await ethers.getContractAt("ComplianceCertificate", d.complianceCertificate);
    const cco2 = await ethers.getContractAt("cCO2", d.cco2);
    const pf = await ethers.getContractAt("ProductFootprint", d.productFootprint);

    const registry = await check.registry();
    const certAddr = await check.certificate();
    const creditIssuer = await check.creditIssuer();
    const certCheck = await cert.capCheck();
    const issuer = await cco2.issuer();
    const retirer = await cco2.retirer();
    const sa = await pf.supplierAttest();

    console.log("\nOn-chain wiring verification:");
    console.log(`  CapCheck.registry()          → ${registry} ${registry === d.capRegistry ? "✓" : "✗"}`);
    console.log(`  CapCheck.certificate()       → ${certAddr} ${certAddr === d.complianceCertificate ? "✓" : "✗"}`);
    console.log(`  CapCheck.creditIssuer()      → ${creditIssuer} ${creditIssuer === d.creditIssuer ? "✓" : "✗"}`);
    console.log(`  Certificate.capCheck()       → ${certCheck} ${certCheck === d.capCheck ? "✓" : "✗"}`);
    console.log(`  cCO2.issuer()                → ${issuer} ${issuer === d.creditIssuer ? "✓" : "✗"}`);
    console.log(`  cCO2.retirer()               → ${retirer} ${retirer === d.creditRetire ? "✓" : "✗"}`);
    console.log(`  ProductFootprint.supplierAttest() → ${sa} ${sa === d.supplierAttest ? "✓" : "✗"}`);
  },
);
