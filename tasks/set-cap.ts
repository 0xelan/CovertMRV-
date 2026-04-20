import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Encryptable } from "@cofhe/sdk";
import * as fs from "fs";
import * as path from "path";
import { createCofheClient } from "./utils";

task("covertmrv:set-cap", "Encrypt and store a regulatory cap for a company")
  .addParam("company", "Address of the company")
  .addParam("cap", "Cap value in tonnes (uint64)")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const { ethers, network } = hre;
    const [signer] = await ethers.getSigners();

    const deployments = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "deployments.json"), "utf8")
    );
    const entry = deployments[network.name];
    if (!entry) throw new Error(`No deployment for ${network.name}`);

    const registry = await ethers.getContractAt(
      "CapRegistry",
      entry.capRegistry,
      signer
    );
    const capCheckAddress: string = entry.capCheck;

    const client = await createCofheClient(hre, signer);
    const [encCap] = await client
      .encryptInputs([Encryptable.uint64(BigInt(args.cap))])
      .execute();

    console.log(`Setting encrypted cap for ${args.company} (${args.cap})...`);
    const tx = await registry.setCap(args.company, encCap);
    await tx.wait();
    console.log(`✓ cap set (tx ${tx.hash})`);

    // Try to grant CapCheck access if a total exists.
    try {
      console.log(`Granting CapCheck read access...`);
      const tx2 = await registry.grantCheckAccess(args.company, capCheckAddress);
      await tx2.wait();
      console.log(`✓ grantCheckAccess (tx ${tx2.hash})`);
    } catch (err) {
      console.log(
        `(skipped grantCheckAccess — call again after company aggregateTotal: ${
          (err as Error).message
        })`
      );
    }
  });
