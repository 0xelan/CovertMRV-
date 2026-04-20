import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

task("covertmrv:grant-role", "Grant a role to an address (owner only)")
  .addParam("user", "Address to grant the role to")
  .addParam("role", "Role: NONE=0 EMITTER=1 AUDITOR=2 REGULATOR=3 ADMIN=4")
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

    const tx = await registry.grantRole(args.user, Number(args.role));
    await tx.wait();
    console.log(`✓ Granted role ${args.role} to ${args.user} (tx ${tx.hash})`);
  });
