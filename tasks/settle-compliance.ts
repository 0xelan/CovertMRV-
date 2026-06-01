import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";
import { createCofheClient } from "./utils";

task("covertmrv:settle", "Regulator decrypt-for-tx and settle compliance (mints certificate)")
  .addParam("company", "Company address")
  .addOptionalParam("year", "Reporting year", "2026")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const { ethers, network } = hre;
    const [signer] = await ethers.getSigners();

    const deployments = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "deployments.json"), "utf8"),
    );
    const entry = deployments[network.name];
    if (!entry) throw new Error(`No deployment for ${network.name}`);

    const capCheck = await ethers.getContractAt("CapCheck", entry.capCheck, signer);
    const year = BigInt(args.year);
    const company = args.company;

    const handle = await capCheck.getComplianceResult(company, year);
    if (handle === 0n || handle === "0x" + "0".repeat(64)) {
      throw new Error(`No compliance result for ${company} year ${year}`);
    }

    const client = await createCofheClient(hre, signer);
    const { decryptedValue, signature } = await client
      .decryptForTx(handle)
      .withPermit()
      .execute();

    console.log(`Settling ${company} year ${year} → ${decryptedValue}...`);
    const tx = await capCheck.settleCompliance(
      company,
      year,
      decryptedValue as boolean,
      signature,
    );
    await tx.wait();
    console.log(`✓ settleCompliance (tx ${tx.hash})`);
  });
