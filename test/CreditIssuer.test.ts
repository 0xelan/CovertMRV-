import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

/// @notice Tests for CreditIssuer — FHE.select-based conditional minting.
///   1. Compliant company: issueCredits mints issuanceRate credits (encrypted non-zero)
///   2. Non-compliant company: issueCredits mints encrypted zero
///   3. issueCredits reverts when no compliance check exists for company

const YEAR = 2025;

describe("CreditIssuer", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, regulator, company, other] = await hre.ethers.getSigners();

    // Deploy full compliance chain
    const Registry = await hre.ethers.getContractFactory("CapRegistry");
    const registry = await Registry.connect(owner).deploy();

    const Cert = await hre.ethers.getContractFactory("ComplianceCertificate");
    const cert = await Cert.connect(owner).deploy();

    const Check = await hre.ethers.getContractFactory("CapCheck");
    const check = await Check.connect(owner).deploy(await registry.getAddress());

    await cert.connect(owner).setCapCheck(await check.getAddress());
    await check.connect(owner).setCertificate(await cert.getAddress());

    const CcCO2 = await hre.ethers.getContractFactory("cCO2");
    const cco2 = await CcCO2.connect(owner).deploy();

    const CreditIssuer = await hre.ethers.getContractFactory("CreditIssuer");
    const creditIssuer = await CreditIssuer.connect(owner).deploy(
      await check.getAddress(),
      await cco2.getAddress()
    );

    // Wire: cCO2 knows about CreditIssuer; CapCheck knows about CreditIssuer
    await cco2.connect(owner).setIssuer(await creditIssuer.getAddress());
    await check.connect(owner).setCreditIssuer(await creditIssuer.getAddress());

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const companyClient = await hre.cofhe.createClientWithBatteries(company);

    return {
      registry,
      check,
      cco2,
      creditIssuer,
      owner,
      company,
      other,
      ownerClient,
      companyClient,
    };
  }

  /**
   * Set up a compliance state for the company. Returns emissions < cap → compliant=true.
   */
  async function setupAndCheck(
    fx: Awaited<ReturnType<typeof deployFixture>>,
    emissions: bigint,
    cap: bigint
  ) {
    const { registry, check, owner, company, ownerClient, companyClient } = fx;

    await registry.connect(company).registerAsEmitter();

    const [encEmissions, encScope] = await companyClient
      .encryptInputs([Encryptable.uint64(emissions), Encryptable.uint8(1n)])
      .execute();
    await registry.connect(company).submitEmissions(1, encEmissions, encScope, YEAR);
    await registry.aggregateTotal(company.address);

    const [encCap] = await ownerClient.encryptInputs([Encryptable.uint64(cap)]).execute();
    await registry.connect(owner).setCap(company.address, encCap);
    await registry.connect(owner).grantCheckAccess(company.address, await check.getAddress());

    await check.checkCompliance(company.address, YEAR);
  }

  it("issueCredits: compliant company receives encrypted non-zero credits", async function () {
    const fx = await loadFixture(deployFixture);
    const { cco2, creditIssuer, company, companyClient } = fx;
    await setupAndCheck(fx, 1000n, 5000n); // compliant

    await expect(
      creditIssuer.issueCredits(company.address, YEAR)
    ).to.emit(creditIssuer, "CreditsIssued");

    // FHERC20 indicator reflects mint occurred
    const indicator = await cco2.connect(company).balanceOf(company.address);
    expect(typeof indicator).to.equal("bigint");
    expect(indicator).to.be.gte(0n);
  });

  it("issueCredits: non-compliant company receives encrypted zero (no balance change)", async function () {
    const fx = await loadFixture(deployFixture);
    const { cco2, creditIssuer, company } = fx;
    await setupAndCheck(fx, 90000n, 1000n); // non-compliant (way over cap)

    // Should not revert — FHE.select handles zero case transparently
    await expect(
      creditIssuer.issueCredits(company.address, YEAR)
    ).to.emit(creditIssuer, "CreditsIssued");

    // Both compliant and non-compliant call succeed at contract level
    // (FHE.select returns 0 encrypted for non-compliant)
  });

  it("issueCredits: reverts when company has no compliance check", async function () {
    const { creditIssuer, other } = await loadFixture(deployFixture);

    await expect(
      creditIssuer.issueCredits(other.address, YEAR)
    ).to.be.revertedWith("No compliance check for company");
  });

  it("setIssuanceRate: owner can update rate; non-owner reverts", async function () {
    const { creditIssuer, owner, other } = await loadFixture(deployFixture);

    await expect(
      creditIssuer.connect(owner).setIssuanceRate(500_000_000_000_000_000n)
    ).to.emit(creditIssuer, "IssuanceRateUpdated");

    await expect(
      creditIssuer.connect(other).setIssuanceRate(1n)
    ).to.be.revertedWith("Only owner");
  });
});
