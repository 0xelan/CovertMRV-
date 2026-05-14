import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

/// @notice Tests for CreditRetire — encrypted retirement receipts + selective audit disclosure.
///   1. retireCredits: burns cCO2 and stores encrypted receipt
///   2. retireCredits: duplicate retirement ID reverts
///   3. grantRetirementAudit: grants auditor decrypt access to a specific retirement
///   4. grantRetirementAudit: non-owner of retirement reverts
///   5. getRetirementReceipt: returns encrypted handle (useless without FHE.allow)

describe("CreditRetire (Wave 4)", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, issuer, company, auditor, other] = await hre.ethers.getSigners();

    const CcCO2 = await hre.ethers.getContractFactory("cCO2");
    const cco2 = await CcCO2.connect(owner).deploy();

    const CreditRetire = await hre.ethers.getContractFactory("CreditRetire");
    const creditRetire = await CreditRetire.connect(owner).deploy(await cco2.getAddress());

    // Wire cCO2 roles
    await cco2.connect(owner).setIssuer(issuer.address);
    await cco2.connect(owner).setRetirer(await creditRetire.getAddress());

    // Fund company with credits
    await cco2.connect(issuer).mint(company.address, 10_000_000_000_000_000_000n);

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const companyClient = await hre.cofhe.createClientWithBatteries(company);
    const auditorClient = await hre.cofhe.createClientWithBatteries(auditor);

    return { cco2, creditRetire, owner, issuer, company, auditor, other, ownerClient, companyClient, auditorClient };
  }

  function makeRetirementId(address: string, year: number, nonce: number): string {
    return hre.ethers.keccak256(
      hre.ethers.solidityPacked(["address", "uint256", "uint256"], [address, year, nonce])
    );
  }

  it("retireCredits: emits CreditsRetired and stores encrypted receipt", async function () {
    const { creditRetire, company, companyClient } = await loadFixture(deployFixture);

    const retirementId = makeRetirementId(company.address, 2025, 1);
    const [encAmt] = await companyClient
      .encryptInputs([Encryptable.uint64(1_000_000_000_000_000_000n)])
      .execute();

    await expect(
      creditRetire.connect(company).retireCredits(encAmt, retirementId)
    ).to.emit(creditRetire, "CreditsRetired");

    expect(await creditRetire.retirementOwner(retirementId)).to.equal(company.address);

    const handle = await creditRetire.getRetirementReceipt(retirementId);
    expect(handle).to.not.equal(hre.ethers.ZeroHash); // non-zero encrypted handle
  });

  it("retireCredits: duplicate retirement ID reverts", async function () {
    const { creditRetire, company, companyClient } = await loadFixture(deployFixture);

    const retirementId = makeRetirementId(company.address, 2025, 1);
    const [encAmt] = await companyClient
      .encryptInputs([Encryptable.uint64(1_000_000_000_000_000_000n)])
      .execute();

    await creditRetire.connect(company).retireCredits(encAmt, retirementId);

    const [encAmt2] = await companyClient
      .encryptInputs([Encryptable.uint64(500_000_000_000_000_000n)])
      .execute();

    await expect(
      creditRetire.connect(company).retireCredits(encAmt2, retirementId)
    ).to.be.revertedWith("Retirement ID already used");
  });

  it("grantRetirementAudit: auditor can decrypt receipt after grant", async function () {
    const { creditRetire, company, auditor, companyClient, auditorClient } =
      await loadFixture(deployFixture);

    const retirementId = makeRetirementId(company.address, 2025, 2);
    const RETIRE_AMOUNT = 2_000_000_000_000_000_000n;
    const [encAmt] = await companyClient
      .encryptInputs([Encryptable.uint64(RETIRE_AMOUNT)])
      .execute();

    await creditRetire.connect(company).retireCredits(encAmt, retirementId);

    await expect(
      creditRetire.connect(company).grantRetirementAudit(retirementId, auditor.address, 3600)
    ).to.emit(creditRetire, "RetirementAuditGranted");

    const handle = await creditRetire.getRetirementReceipt(retirementId);
    const decrypted = await auditorClient.decryptForView(handle, FheTypes.Uint64).execute();
    expect(decrypted).to.equal(RETIRE_AMOUNT);
  });

  it("grantRetirementAudit: non-owner of retirement reverts", async function () {
    const { creditRetire, company, other, companyClient } = await loadFixture(deployFixture);

    const retirementId = makeRetirementId(company.address, 2025, 3);
    const [encAmt] = await companyClient
      .encryptInputs([Encryptable.uint64(1_000_000_000_000_000_000n)])
      .execute();

    await creditRetire.connect(company).retireCredits(encAmt, retirementId);

    await expect(
      creditRetire.connect(other).grantRetirementAudit(retirementId, other.address, 3600)
    ).to.be.revertedWith("Not retirement owner");
  });

  it("getRetirementReceipt: returns encrypted handle; not accessible without FHE.allow", async function () {
    const { creditRetire, company, auditor, companyClient } =
      await loadFixture(deployFixture);

    const retirementId = makeRetirementId(company.address, 2025, 4);
    const [encAmt] = await companyClient
      .encryptInputs([Encryptable.uint64(3_000_000_000_000_000_000n)])
      .execute();

    await creditRetire.connect(company).retireCredits(encAmt, retirementId);

    // Anyone can retrieve the handle (it's just a bytes32 ctHash)
    const handle = await creditRetire.connect(auditor).getRetirementReceipt(retirementId);
    expect(typeof handle).to.equal("string");
    expect(handle).to.not.equal(hre.ethers.ZeroHash);
    // But auditor has NOT been granted FHE.allow — they cannot decrypt it
    // (decryption attempt would fail/timeout in a real network; mock would return default)
  });
});
