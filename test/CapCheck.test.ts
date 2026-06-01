import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

const YEAR = 2025;
const YEAR_B = 2026;

describe("CapCheck", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, company, other] = await hre.ethers.getSigners();

    const Registry = await hre.ethers.getContractFactory("CapRegistry");
    const registry = await Registry.connect(owner).deploy();
    await registry.waitForDeployment();

    const Certificate = await hre.ethers.getContractFactory("ComplianceCertificate");
    const cert = await Certificate.connect(owner).deploy();
    await cert.waitForDeployment();

    const Check = await hre.ethers.getContractFactory("CapCheck");
    const check = await Check.connect(owner).deploy(
      await registry.getAddress()
    );
    await check.waitForDeployment();

    await cert.connect(owner).setCapCheck(await check.getAddress());
    await check.connect(owner).setCertificate(await cert.getAddress());

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const companyClient = await hre.cofhe.createClientWithBatteries(company);

    return {
      registry,
      check,
      cert,
      owner,
      company,
      other,
      ownerClient,
      companyClient,
    };
  }

  async function setupCompliantState(
    deployed: Awaited<ReturnType<typeof deployFixture>>,
    emissions: bigint,
    cap: bigint,
    year = YEAR
  ) {
    const { registry, check, owner, company, ownerClient, companyClient } =
      deployed;

    await registry.connect(company).registerAsEmitter();

    const [encEmissions, encScope] = await companyClient
      .encryptInputs([Encryptable.uint64(emissions), Encryptable.uint8(1n)])
      .execute();
    await registry.connect(company).submitEmissions(1, encEmissions, encScope, year);
    await registry.aggregateTotal(company.address, year);

    const [encCap] = await ownerClient
      .encryptInputs([Encryptable.uint64(cap)])
      .execute();
    await registry.connect(owner).setCap(company.address, year, encCap);

    await registry
      .connect(owner)
      .grantCheckAccess(company.address, year, await check.getAddress());
  }

  it("checkCompliance computes FHE.lte(total, cap) and emits event", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await expect(fx.check.checkCompliance(fx.company.address, YEAR)).to.emit(
      fx.check,
      "ComplianceChecked"
    );
  });

  it("company can decrypt its own compliance ebool", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await fx.check.connect(fx.company).checkCompliance(fx.company.address, YEAR);

    const handle = await fx.check.getComplianceResult(fx.company.address, YEAR);
    const result = await fx.companyClient
      .decryptForView(handle, FheTypes.Bool)
      .execute();
    expect(result).to.equal(true);
  });

  it("owner can decrypt compliance ebool", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await fx.check.checkCompliance(fx.company.address, YEAR);

    const handle = await fx.check.getComplianceResult(fx.company.address, YEAR);
    const result = await fx.ownerClient
      .decryptForView(handle, FheTypes.Bool)
      .execute();
    expect(result).to.equal(true);
  });

  it("non-compliant emissions decrypt to false", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 90000n, 1000n);
    await fx.check.checkCompliance(fx.company.address, YEAR);

    const handle = await fx.check.getComplianceResult(fx.company.address, YEAR);
    const result = await fx.companyClient
      .decryptForView(handle, FheTypes.Bool)
      .execute();
    expect(result).to.equal(false);
  });

  it("third party cannot checkCompliance for another company", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await expect(
      fx.check.connect(fx.other).checkCompliance(fx.company.address, YEAR)
    ).to.be.revertedWith("Not authorized");
  });

  it("cap for one year cannot satisfy another year's check", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n, YEAR);
    await expect(
      fx.check.checkCompliance(fx.company.address, YEAR_B)
    ).to.be.revertedWith("No emissions total");
  });

  it("checkCompliance reverts when no total exists", async function () {
    const fx = await loadFixture(deployFixture);
    await expect(
      fx.check.checkCompliance(fx.company.address, YEAR)
    ).to.be.revertedWith("No emissions total");
  });

  it("checkCompliance reverts when no cap exists", async function () {
    const fx = await loadFixture(deployFixture);
    await fx.registry.connect(fx.company).registerAsEmitter();
    const [encE, encScope] = await fx.companyClient
      .encryptInputs([Encryptable.uint64(1n), Encryptable.uint8(1n)])
      .execute();
    await fx.registry.connect(fx.company).submitEmissions(1, encE, encScope, YEAR);
    await fx.registry.aggregateTotal(fx.company.address, YEAR);
    await expect(
      fx.check.checkCompliance(fx.company.address, YEAR)
    ).to.be.revertedWith("No regulatory cap");
  });

  it("settleCompliance writes plaintext result and mints certificate", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await fx.check.checkCompliance(fx.company.address, YEAR);

    const handle = await fx.check.getComplianceResult(fx.company.address, YEAR);
    const { decryptedValue, signature } = await fx.ownerClient
      .decryptForTx(handle)
      .withPermit()
      .execute();

    const tx = await fx.check
      .connect(fx.owner)
      .settleCompliance(
        fx.company.address,
        YEAR,
        decryptedValue as boolean,
        signature
      );
    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (l: { fragment?: { name: string } }) => l?.fragment?.name === "ComplianceSettled"
    ) as { args: [string, bigint, boolean, bigint] } | undefined;
    expect(event).to.not.be.undefined;
    expect(event!.args[2]).to.equal(true);
    const tokenId = event!.args[3];
    expect(tokenId).to.be.gt(0n);

    expect(await fx.cert.ownerOf(tokenId)).to.equal(fx.company.address);
    const certData = await fx.cert.getCertificate(fx.company.address, YEAR);
    expect(certData.compliant).to.equal(true);
    expect(certData.reportingYear).to.equal(YEAR);

    const [settled, value] = await fx.check.isSettled(fx.company.address, YEAR);
    expect(settled).to.equal(true);
    expect(value).to.equal(true);
  });

  it("non-owner cannot settle", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await fx.check.checkCompliance(fx.company.address, YEAR);
    await expect(
      fx.check
        .connect(fx.other)
        .settleCompliance(fx.company.address, YEAR, true, "0x")
    ).to.be.revertedWith("Only owner");
  });

  it("double settle reverts", async function () {
    const fx = await loadFixture(deployFixture);
    await setupCompliantState(fx, 1000n, 5000n);
    await fx.check.checkCompliance(fx.company.address, YEAR);

    const handle = await fx.check.getComplianceResult(fx.company.address, YEAR);
    const { decryptedValue, signature } = await fx.ownerClient
      .decryptForTx(handle)
      .withPermit()
      .execute();

    await fx.check
      .connect(fx.owner)
      .settleCompliance(
        fx.company.address,
        YEAR,
        decryptedValue as boolean,
        signature
      );

    await expect(
      fx.check
        .connect(fx.owner)
        .settleCompliance(
          fx.company.address,
          YEAR,
          decryptedValue as boolean,
          signature
        )
    ).to.be.revertedWith("Already settled");
  });
});
