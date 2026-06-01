import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

/// @notice Tests for ProductFootprint — multi-supplier encrypted footprint rollup.
///   1. Single supplier: computeFootprint returns handle equal to supplier factor
///   2. Multi-supplier: FHE.add aggregates correctly
///   3. Empty suppliers array reverts
///   4. classifyBand: ≤100 tCO2e → band A (0)
///   5. classifyBand: 101-500 tCO2e → band B (1)
///   6. classifyBand: >500 tCO2e → band C (2)
///   7. checkThreshold: double-blind pass/fail

describe("ProductFootprint", function () {
  const SKU = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("SKU-WIDGET-001"));

  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, manufacturer, supplier1, supplier2, supplier3] =
      await hre.ethers.getSigners();

    // Deploy SupplierAttest
    const SupplierAttest = await hre.ethers.getContractFactory("SupplierAttest");
    const supplierAttest = await SupplierAttest.connect(owner).deploy();
    await supplierAttest.waitForDeployment();

    // Deploy ProductFootprint
    const ProductFootprint = await hre.ethers.getContractFactory("ProductFootprint");
    const productFootprint = await ProductFootprint.connect(owner).deploy(
      await supplierAttest.getAddress()
    );
    await productFootprint.waitForDeployment();

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const manufacturerClient = await hre.cofhe.createClientWithBatteries(manufacturer);
    const supplier1Client = await hre.cofhe.createClientWithBatteries(supplier1);
    const supplier2Client = await hre.cofhe.createClientWithBatteries(supplier2);

    return {
      supplierAttest,
      productFootprint,
      owner,
      manufacturer,
      supplier1,
      supplier2,
      supplier3,
      ownerClient,
      manufacturerClient,
      supplier1Client,
      supplier2Client,
    };
  }

  /** Register supplier as EMITTER and submit a factor for SKU. */
  async function registerSupplier(
    supplierAttest: Awaited<ReturnType<typeof deployFixture>>["supplierAttest"],
    supplier: Awaited<ReturnType<typeof hre.ethers.getSigners>>[number],
    client: Awaited<ReturnType<typeof hre.cofhe.createClientWithBatteries>>,
    factor: bigint
  ) {
    await supplierAttest.connect(supplier).registerAsEmitter();
    const [encFactor] = await client
      .encryptInputs([Encryptable.uint64(factor)])
      .execute();
    await supplierAttest.connect(supplier).submitFactor(SKU, encFactor, 2025);
  }

  it("computeFootprint: single supplier — handle decrypts to supplier factor", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier1Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 80n);

    // ProductFootprint needs allowTransient permission which SupplierAttest.getFactor issues
    const handle = await productFootprint
      .connect(manufacturer)
      .computeFootprint.staticCall(SKU, [supplier1.address]);
    // Non-static call to actually emit and store
    await productFootprint.connect(manufacturer).computeFootprint(SKU, [supplier1.address]);

    const stored = await productFootprint.getFootprintResult(manufacturer.address, SKU);
    expect(stored).to.not.equal(hre.ethers.ZeroHash);

    // Manufacturer was granted FHE.allow — can decrypt
    const decrypted = await manufacturerClient.decryptForView(handle, FheTypes.Uint64).execute();
    expect(decrypted).to.equal(80n);
  });

  it("computeFootprint: two suppliers — FHE.add aggregates correctly", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier2, supplier1Client, supplier2Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 120n);
    await registerSupplier(supplierAttest, supplier2, supplier2Client, 230n);

    const handle = await productFootprint
      .connect(manufacturer)
      .computeFootprint.staticCall(SKU, [supplier1.address, supplier2.address]);
    await productFootprint.connect(manufacturer).computeFootprint(SKU, [supplier1.address, supplier2.address]);

    const decrypted = await manufacturerClient.decryptForView(handle, FheTypes.Uint64).execute();
    expect(decrypted).to.equal(350n); // 120 + 230
  });

  it("computeFootprint: empty suppliers array reverts", async function () {
    const { productFootprint, manufacturer } = await loadFixture(deployFixture);
    await expect(
      productFootprint.connect(manufacturer).computeFootprint(SKU, [])
    ).to.be.revertedWith("No suppliers");
  });

  it("classifyBand: total ≤ 100 tCO2e → band A (encrypted 0)", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier1Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 75n); // ≤ 100 → A

    const handle = await productFootprint
      .connect(manufacturer)
      .classifyBand.staticCall(SKU, [supplier1.address]);
    await productFootprint.connect(manufacturer).classifyBand(SKU, [supplier1.address]);

    const band = await manufacturerClient.decryptForView(handle, FheTypes.Uint8).execute();
    expect(band).to.equal(0n); // band A
  });

  it("classifyBand: total 101-500 tCO2e → band B (encrypted 1)", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier1Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 300n); // 101-500 → B

    const handle = await productFootprint
      .connect(manufacturer)
      .classifyBand.staticCall(SKU, [supplier1.address]);
    await productFootprint.connect(manufacturer).classifyBand(SKU, [supplier1.address]);

    const band = await manufacturerClient.decryptForView(handle, FheTypes.Uint8).execute();
    expect(band).to.equal(1n); // band B
  });

  it("classifyBand: total > 500 tCO2e → band C (encrypted 2)", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier1Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 750n); // > 500 → C

    const handle = await productFootprint
      .connect(manufacturer)
      .classifyBand.staticCall(SKU, [supplier1.address]);
    await productFootprint.connect(manufacturer).classifyBand(SKU, [supplier1.address]);

    const band = await manufacturerClient.decryptForView(handle, FheTypes.Uint8).execute();
    expect(band).to.equal(2n); // band C
  });

  it("checkThreshold: double-blind pass/fail — true when footprint ≤ threshold", async function () {
    const { supplierAttest, productFootprint, manufacturer, supplier1, supplier1Client, manufacturerClient } =
      await loadFixture(deployFixture);
    await registerSupplier(supplierAttest, supplier1, supplier1Client, 200n);

    // Manufacturer encrypts a threshold of 300 tCO2e — footprint 200 ≤ 300 → true
    const [encThreshold] = await manufacturerClient
      .encryptInputs([Encryptable.uint64(300n)])
      .execute();

    const handle = await productFootprint
      .connect(manufacturer)
      .checkThreshold.staticCall(SKU, [supplier1.address], encThreshold);
    await productFootprint.connect(manufacturer).checkThreshold(SKU, [supplier1.address], encThreshold);

    const result = await manufacturerClient.decryptForView(handle, FheTypes.Bool).execute();
    expect(result).to.equal(true);
  });

  it("setBandThresholds: owner can update thresholds; non-owner reverts", async function () {
    const { productFootprint, owner, manufacturer } = await loadFixture(deployFixture);

    await expect(
      productFootprint.connect(owner).setBandThresholds(50n, 250n)
    ).to.not.be.reverted;
    expect(await productFootprint.bandAThreshold()).to.equal(50n);
    expect(await productFootprint.bandBThreshold()).to.equal(250n);

    await expect(
      productFootprint.connect(manufacturer).setBandThresholds(50n, 250n)
    ).to.be.revertedWith("Only owner");
  });
});
