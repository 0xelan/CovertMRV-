import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

describe("CapRegistry", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [owner, company, auditor, other] = await hre.ethers.getSigners();

    const Registry = await hre.ethers.getContractFactory("CapRegistry");
    const registry = await Registry.connect(owner).deploy();
    await registry.waitForDeployment();

    // Each signer needs its own client to encrypt with their address.
    const ownerClient = await hre.cofhe.createClientWithBatteries(owner);
    const companyClient = await hre.cofhe.createClientWithBatteries(company);
    const auditorClient = await hre.cofhe.createClientWithBatteries(auditor);

    return {
      registry,
      owner,
      company,
      auditor,
      other,
      ownerClient,
      companyClient,
      auditorClient,
    };
  }

  describe("Submissions", function () {
    it("EMITTER can submit encrypted emissions", async function () {
      const { registry, company, companyClient } = await loadFixture(
        deployFixture
      );
      await registry.connect(company).registerAsEmitter();

      const [enc] = await companyClient
        .encryptInputs([Encryptable.uint64(12500n)])
        .execute();

      await expect(registry.connect(company).submitEmissions(1, enc))
        .to.emit(registry, "EmissionsSubmitted");

      expect(await registry.isFacilitySubmitted(company.address, 1)).to.equal(
        true
      );
      expect(await registry.getFacilityCount(company.address)).to.equal(1n);
    });

    it("non-EMITTER cannot submit emissions", async function () {
      const { registry, other, companyClient } = await loadFixture(
        deployFixture
      );
      const [enc] = await companyClient
        .encryptInputs([Encryptable.uint64(100n)])
        .execute();

      await expect(
        registry.connect(other).submitEmissions(1, enc)
      ).to.be.revertedWith("Must be EMITTER");
    });

    it("re-submitting the same facility updates without growing list", async function () {
      const { registry, company, companyClient } = await loadFixture(
        deployFixture
      );
      await registry.connect(company).registerAsEmitter();

      const [a] = await companyClient
        .encryptInputs([Encryptable.uint64(100n)])
        .execute();
      const [b] = await companyClient
        .encryptInputs([Encryptable.uint64(200n)])
        .execute();

      await registry.connect(company).submitEmissions(1, a);
      await registry.connect(company).submitEmissions(1, b);

      expect(await registry.getFacilityCount(company.address)).to.equal(1n);
    });

    it("getMyEmissions reverts when not submitted", async function () {
      const { registry, company } = await loadFixture(deployFixture);
      await registry.connect(company).registerAsEmitter();
      await expect(registry.connect(company).getMyEmissions(99)).to.be
        .revertedWith("Not submitted");
    });
  });

  describe("Aggregation", function () {
    it("FHE.add aggregates across multiple facilities", async function () {
      const { registry, company, companyClient } = await loadFixture(
        deployFixture
      );
      await registry.connect(company).registerAsEmitter();

      for (const [id, value] of [
        [1, 1000n],
        [2, 2500n],
        [3, 4000n],
      ] as Array<[number, bigint]>) {
        const [enc] = await companyClient
          .encryptInputs([Encryptable.uint64(value)])
          .execute();
        await registry.connect(company).submitEmissions(id, enc);
      }

      await expect(registry.aggregateTotal(company.address)).to.emit(
        registry,
        "TotalAggregated"
      );

      const totalHandle = await registry.getCompanyTotal(company.address);
      const decrypted = await companyClient
        .decryptForView(totalHandle, FheTypes.Uint64)
        .execute();
      expect(decrypted).to.equal(7500n);
    });

    it("aggregateTotal reverts when no facilities", async function () {
      const { registry, company } = await loadFixture(deployFixture);
      await expect(
        registry.aggregateTotal(company.address)
      ).to.be.revertedWith("No facilities");
    });
  });

  describe("Cap registry", function () {
    it("owner can set encrypted cap", async function () {
      const { registry, owner, company, ownerClient } = await loadFixture(
        deployFixture
      );
      const [enc] = await ownerClient
        .encryptInputs([Encryptable.uint64(50000n)])
        .execute();
      await expect(
        registry.connect(owner).setCap(company.address, enc)
      ).to.emit(registry, "CapSet");
    });

    it("non-owner cannot set cap", async function () {
      const { registry, company, ownerClient } = await loadFixture(
        deployFixture
      );
      const [enc] = await ownerClient
        .encryptInputs([Encryptable.uint64(50000n)])
        .execute();
      await expect(
        registry.connect(company).setCap(company.address, enc)
      ).to.be.revertedWith("Only owner");
    });
  });

  describe("Audit access", function () {
    it("grants timed audit access and lets auditor decrypt the total", async function () {
      const {
        registry,
        company,
        auditor,
        companyClient,
        auditorClient,
      } = await loadFixture(deployFixture);

      await registry.connect(company).registerAsEmitter();
      const [enc] = await companyClient
        .encryptInputs([Encryptable.uint64(9999n)])
        .execute();
      await registry.connect(company).submitEmissions(1, enc);
      await registry.aggregateTotal(company.address);

      await expect(
        registry
          .connect(company)
          .grantAuditAccessToTotal(auditor.address, 3600)
      ).to.emit(registry, "AuditAccessGranted");

      expect(
        await registry.isAuditActive(company.address, auditor.address)
      ).to.equal(true);

      const totalHandle = await registry.getCompanyTotal(company.address);
      const decrypted = await auditorClient
        .decryptForView(totalHandle, FheTypes.Uint64)
        .execute();
      expect(decrypted).to.equal(9999n);
    });

    it("audit access expires after duration", async function () {
      const { registry, company, auditor, companyClient } = await loadFixture(
        deployFixture
      );
      await registry.connect(company).registerAsEmitter();
      const [enc] = await companyClient
        .encryptInputs([Encryptable.uint64(1n)])
        .execute();
      await registry.connect(company).submitEmissions(1, enc);
      await registry.aggregateTotal(company.address);
      await registry
        .connect(company)
        .grantAuditAccessToTotal(auditor.address, 60);

      await time.increase(120);

      expect(
        await registry.isAuditActive(company.address, auditor.address)
      ).to.equal(false);
    });

    it("revokeAuditAccess flips active flag", async function () {
      const { registry, company, auditor, companyClient } = await loadFixture(
        deployFixture
      );
      await registry.connect(company).registerAsEmitter();
      const [enc] = await companyClient
        .encryptInputs([Encryptable.uint64(1n)])
        .execute();
      await registry.connect(company).submitEmissions(1, enc);
      await registry.aggregateTotal(company.address);
      await registry
        .connect(company)
        .grantAuditAccessToTotal(auditor.address, 3600);

      await registry.connect(company).revokeAuditAccess(auditor.address);
      expect(
        await registry.isAuditActive(company.address, auditor.address)
      ).to.equal(false);
    });
  });
});
