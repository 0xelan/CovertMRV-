import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

/// @notice Tests Wave 4 privacy hardening in CapRegistry:
///   1. companyFacilities is private — no external enumeration
///   2. hasSubmitted is private — not directly readable
///   3. encryptedScope is truly encrypted (returns handle, not plaintext)
///   4. encryptedFacilityCount is returned as euint64 handle
///   5. getFacilityCount(address) is restricted to owner or the company itself

describe("CapRegistryPrivacy (Wave 4)", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, company, auditor, other] = await hre.ethers.getSigners();

    const Registry = await hre.ethers.getContractFactory("CapRegistry");
    const registry = await Registry.connect(owner).deploy();
    await registry.waitForDeployment();

    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const companyClient = await hre.cofhe.createClientWithBatteries(company);
    const auditorClient = await hre.cofhe.createClientWithBatteries(auditor);

    return { registry, owner, company, auditor, other, ownerClient, companyClient, auditorClient };
  }

  async function submitFacility(
    registry: Awaited<ReturnType<typeof deployFixture>>["registry"],
    signer: Awaited<ReturnType<typeof hre.ethers.getSigners>>[number],
    client: Awaited<ReturnType<typeof hre.cofhe.createClientWithBatteries>>,
    facilityId: number,
    emissionsValue: bigint,
    year = 2025,
    scope = 1
  ) {
    const [encEmissions, encScope] = await client
      .encryptInputs([Encryptable.uint64(emissionsValue), Encryptable.uint8(BigInt(scope))])
      .execute();
    return registry.connect(signer).submitEmissions(facilityId, encEmissions, encScope, year);
  }

  // ─── Privacy gap #1: companyFacilities is private ────────────────────────

  it("companyFacilities mapping is not directly accessible from outside (private)", async function () {
    const { registry } = await loadFixture(deployFixture);
    // Solidity private mappings have no getter — verifying the ABI does not expose it
    const abi = registry.interface.fragments.map((f) => f.type + ":" + (f as any).name);
    expect(abi.some((x) => x.includes("companyFacilities"))).to.equal(false);
  });

  // ─── Privacy gap #2: hasSubmitted is private ─────────────────────────────

  it("hasSubmitted mapping is not publicly accessible (private)", async function () {
    const { registry } = await loadFixture(deployFixture);
    const abi = registry.interface.fragments.map((f) => f.type + ":" + (f as any).name);
    expect(abi.some((x) => x.includes("hasSubmitted"))).to.equal(false);
  });

  // ─── Privacy gap #3/4: getFacilityCount restricted to owner or company ────

  it("getFacilityCount reverts for third parties who are not owner or company", async function () {
    const { registry, company, companyClient, other, owner } = await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    await submitFacility(registry, company, companyClient, 42, 5000n);

    // 'other' is neither owner nor company — should revert
    await expect(
      registry.connect(other).getFacilityCount(company.address)
    ).to.be.revertedWith("Unauthorized");
  });

  it("getFacilityCount succeeds for owner", async function () {
    const { registry, company, companyClient, owner } = await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    await submitFacility(registry, company, companyClient, 1, 1000n);

    expect(await registry.connect(owner).getFacilityCount(company.address)).to.equal(1n);
  });

  it("getFacilityCount succeeds for the company itself", async function () {
    const { registry, company, companyClient } = await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    await submitFacility(registry, company, companyClient, 1, 1000n);
    await submitFacility(registry, company, companyClient, 2, 2000n);

    expect(await registry.connect(company).getFacilityCount(company.address)).to.equal(2n);
  });

  // ─── Privacy gap #5: encrypted scope returns a euint8 handle, not plaintext

  it("getFacilityScope returns an encrypted handle (euint8), not a plaintext enum", async function () {
    const { registry, company, companyClient } = await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    // Submit with scope = 2 (Scope3)
    await submitFacility(registry, company, companyClient, 7, 9999n, 2025, 2);

    const scopeHandle = await registry.getFacilityScope(company.address, 7);

    // The returned value is an encrypted handle (bytes32 ctHash), not 0/1/2
    // euint8 is `type euint8 is bytes32` in cofhe-contracts — ethers.js returns hex string
    expect(typeof scopeHandle).to.equal("string");
    // It is NOT the raw plaintext scope value (2)
    expect(scopeHandle).to.not.equal(2n);
    expect(scopeHandle).to.not.equal(hre.ethers.ZeroHash);
  });

  // ─── Privacy gap #6: encryptedFacilityCount returns euint64 handle ──────

  it("getEncryptedFacilityCount returns a non-zero euint64 handle after submission", async function () {
    const { registry, company, companyClient } = await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    await submitFacility(registry, company, companyClient, 5, 1234n);

    const countHandle = await registry.getEncryptedFacilityCount(company.address);
    // euint64 is `type euint64 is bytes32` in cofhe-contracts — ethers.js returns hex string
    expect(typeof countHandle).to.equal("string");
    // Zero address / uninitialized would be ZeroHash — handle should be non-zero
    expect(countHandle).to.not.equal(hre.ethers.ZeroHash);
  });

  // ─── grantFacilityDecrypt allows auditor to see scope and emissions ──────

  it("grantFacilityDecrypt lets a company give auditor timed scope+emissions access", async function () {
    const { registry, company, auditor, companyClient, auditorClient } =
      await loadFixture(deployFixture);
    await registry.connect(company).registerAsEmitter();
    await submitFacility(registry, company, companyClient, 3, 7777n, 2025, 1);

    await registry.connect(company).grantFacilityDecrypt(3, auditor.address);

    const scopeHandle = await registry.getFacilityScope(company.address, 3);
    const decScope = await auditorClient.decryptForView(scopeHandle, FheTypes.Uint8).execute();
    expect(decScope).to.equal(1n); // scope 1 = Scope2
  });
});
