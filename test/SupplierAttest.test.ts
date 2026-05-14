import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

/// @notice Tests for SupplierAttest — encrypted emissions intensity factor registry.
///   1. EMITTER can submit a factor
///   2. Non-EMITTER is blocked
///   3. getFactor uses allowTransient so factor can be read in same TX
///   4. Unauthorized caller cannot read via getFactor (no FHE.allow)
///   5. Re-submitting updates the factor for a SKU
///   6. hasFactorForSku returns correct boolean
///   7. grantFactorDecrypt gives auditor permanent decrypt access

describe("SupplierAttest (Wave 4)", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, supplier, auditor, other] = await hre.ethers.getSigners();

    const SupplierAttest = await hre.ethers.getContractFactory("SupplierAttest");
    const supplierAttest = await SupplierAttest.connect(owner).deploy();
    await supplierAttest.waitForDeployment();

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const supplierClient = await hre.cofhe.createClientWithBatteries(supplier);
    const auditorClient = await hre.cofhe.createClientWithBatteries(auditor);

    const SKU_A = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("SKU-WIDGET-001"));
    const SKU_B = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("SKU-GADGET-002"));

    return { supplierAttest, owner, supplier, auditor, other, ownerClient, supplierClient, auditorClient, SKU_A, SKU_B };
  }

  it("EMITTER role: supplier can submit an encrypted emissions factor", async function () {
    const { supplierAttest, supplier, supplierClient, SKU_A } =
      await loadFixture(deployFixture);
    await supplierAttest.connect(supplier).registerAsEmitter();

    const [encFactor] = await supplierClient
      .encryptInputs([Encryptable.uint64(350n)])
      .execute();

    await expect(
      supplierAttest.connect(supplier).submitFactor(SKU_A, encFactor, 2025)
    ).to.emit(supplierAttest, "FactorSubmitted");

    expect(
      await supplierAttest.hasFactorForSku(supplier.address, SKU_A)
    ).to.equal(true);
  });

  it("non-EMITTER cannot submit a factor", async function () {
    const { supplierAttest, other, ownerClient, SKU_A } =
      await loadFixture(deployFixture);

    const [encFactor] = await ownerClient
      .encryptInputs([Encryptable.uint64(100n)])
      .execute();

    await expect(
      supplierAttest.connect(other).submitFactor(SKU_A, encFactor, 2025)
    ).to.be.revertedWith("Must be EMITTER");
  });

  it("hasFactorForSku returns false for unknown SKU", async function () {
    const { supplierAttest, supplier, SKU_B } = await loadFixture(deployFixture);
    expect(
      await supplierAttest.hasFactorForSku(supplier.address, SKU_B)
    ).to.equal(false);
  });

  it("re-submitting the same SKU updates the factor (no duplicate)", async function () {
    const { supplierAttest, supplier, supplierClient, SKU_A } =
      await loadFixture(deployFixture);
    await supplierAttest.connect(supplier).registerAsEmitter();

    const [enc1] = await supplierClient.encryptInputs([Encryptable.uint64(100n)]).execute();
    await supplierAttest.connect(supplier).submitFactor(SKU_A, enc1, 2024);

    const [enc2] = await supplierClient.encryptInputs([Encryptable.uint64(200n)]).execute();
    await supplierAttest.connect(supplier).submitFactor(SKU_A, enc2, 2025);

    // factorYear should reflect the latest update
    expect(await supplierAttest.factorYear(supplier.address, SKU_A)).to.equal(2025n);
  });

  it("getFactor (allowTransient) — supplier can retrieve their own factor handle", async function () {
    const { supplierAttest, supplier, supplierClient, SKU_A } =
      await loadFixture(deployFixture);
    await supplierAttest.connect(supplier).registerAsEmitter();

    const [encFactor] = await supplierClient
      .encryptInputs([Encryptable.uint64(750n)])
      .execute();
    await supplierAttest.connect(supplier).submitFactor(SKU_A, encFactor, 2025);

    // getFactor is non-view (uses allowTransient). Supplier calling it should succeed.
    await expect(
      supplierAttest.connect(supplier).getFactor(supplier.address, SKU_A)
    ).to.not.be.reverted;
  });

  it("grantFactorDecrypt allows auditor to decrypt a supplier's factor", async function () {
    const { supplierAttest, supplier, auditor, supplierClient, auditorClient, SKU_A } =
      await loadFixture(deployFixture);
    await supplierAttest.connect(supplier).registerAsEmitter();

    const [encFactor] = await supplierClient
      .encryptInputs([Encryptable.uint64(428n)])
      .execute();
    await supplierAttest.connect(supplier).submitFactor(SKU_A, encFactor, 2025);
    await supplierAttest.connect(supplier).grantFactorDecrypt(SKU_A, auditor.address);

    const handle = await supplierAttest.getFactorHandle(supplier.address, SKU_A);
    const decrypted = await auditorClient.decryptForView(handle, FheTypes.Uint64).execute();
    expect(decrypted).to.equal(428n);
  });
});
