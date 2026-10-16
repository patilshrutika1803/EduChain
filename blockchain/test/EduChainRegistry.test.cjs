const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("EduChainRegistry", function () {
  const credentialId = ethers.id("fictional-credential-001");
  const commitment = ethers.keccak256(ethers.toUtf8Bytes("salted-fictional-payload"));

  async function deploy() {
    const [admin, issuer, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("EduChainRegistry");
    const registry = await factory.deploy(admin.address);
    await registry.waitForDeployment();
    return { admin, issuer, other, registry };
  }

  async function expectRevert(promise, message) {
    await assert.rejects(promise, message);
  }

  it("sets a distinct administrator on deployment", async function () {
    const { admin, issuer, registry } = await deploy();
    assert.equal(await registry.hasRole(await registry.ADMIN_ROLE(), admin.address), true);
    assert.equal(await registry.hasRole(await registry.DEFAULT_ADMIN_ROLE(), admin.address), true);
    assert.equal(await registry.isAuthorizedIssuer(issuer.address), false);
    await expectRevert(
      registry.connect(issuer).authorizeIssuer(issuer.address),
      /AccessControlUnauthorizedAccount/,
    );
  });

  it("allows only the administrator to grant and revoke issuers and emits events", async function () {
    const { admin, issuer, other, registry } = await deploy();
    const authorization = await registry.authorizeIssuer(issuer.address);
    const receipt = await authorization.wait();
    const parsed = receipt.logs
      .map((log) => {
        try { return registry.interface.parseLog(log); } catch { return null; }
      })
      .find((log) => log?.name === "IssuerAuthorizationChanged");
    assert.equal(parsed.args.issuer, issuer.address);
    assert.equal(parsed.args.authorized, true);
    assert.equal(await registry.isAuthorizedIssuer(issuer.address), true);

    await expectRevert(
      registry.connect(issuer).revokeIssuer(issuer.address),
      /AccessControlUnauthorizedAccount/,
    );
    await registry.connect(admin).revokeIssuer(issuer.address);
    assert.equal(await registry.isAuthorizedIssuer(issuer.address), false);
    await expectRevert(registry.connect(other).authorizeIssuer(other.address), /AccessControlUnauthorizedAccount/);

    const role = await registry.ISSUER_ROLE();
    const directGrant = await registry.grantRole(role, issuer.address);
    const directReceipt = await directGrant.wait();
    const directEvent = directReceipt.logs
      .map((log) => {
        try { return registry.interface.parseLog(log); } catch { return null; }
      })
      .find((log) => log?.name === "IssuerAuthorizationChanged");
    assert.equal(directEvent.args.authorized, true);
    await registry.revokeRole(role, issuer.address);
    assert.equal(await registry.isAuthorizedIssuer(issuer.address), false);
    await expectRevert(registry.connect(issuer).renounceRole(role, issuer.address), /AccessControlUnauthorizedAccount/);
    await expectRevert(registry.grantRole(role, ethers.ZeroAddress), /ZeroAddress/);
  });

  it("issues once, emits the proof and stores only the hash, commitment and issuer metadata", async function () {
    const { admin, issuer, registry } = await deploy();
    await registry.authorizeIssuer(issuer.address);
    const tx = await registry.connect(issuer).issueCredential(credentialId, commitment);
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log) => {
        try { return registry.interface.parseLog(log); } catch { return null; }
      })
      .find((log) => log?.name === "CredentialIssued");
    assert.equal(event.args.credentialIdHash, credentialId);
    assert.equal(event.args.commitment, commitment);
    assert.equal(event.args.issuer, issuer.address);

    const proof = await registry.credentialProof(credentialId);
    assert.equal(proof.commitment, commitment);
    assert.equal(proof.issuer, issuer.address);
    assert.equal(proof.issuedAt > 0n, true);
    assert.equal(proof.status, 0n);
    assert.equal(await registry.hasCredential(credentialId), true);
    assert.equal(await registry.hasRole(await registry.DEFAULT_ADMIN_ROLE(), admin.address), true);
    await expectRevert(
      registry.connect(issuer).issueCredential(credentialId, commitment),
      /DuplicateCredential/,
    );
  });

  it("rejects unauthorized issuance and invalid inputs", async function () {
    const { issuer, other, registry } = await deploy();
    await expectRevert(
      registry.connect(other).issueCredential(credentialId, commitment),
      /AccessControlUnauthorizedAccount/,
    );
    await registry.authorizeIssuer(issuer.address);
    await expectRevert(
      registry.connect(issuer).issueCredential(ethers.ZeroHash, commitment),
      /ZeroCredentialId/,
    );
    await expectRevert(
      registry.connect(issuer).issueCredential(credentialId, ethers.ZeroHash),
      /ZeroCommitment/,
    );
    await expectRevert(registry.authorizeIssuer(ethers.ZeroAddress), /ZeroAddress/);
    await expectRevert(registry.revokeIssuer(ethers.ZeroAddress), /ZeroAddress/);
    const factory = await ethers.getContractFactory("EduChainRegistry");
    await expectRevert(factory.deploy(ethers.ZeroAddress), /ZeroAddress/);
  });

  it("supports suspension and reinstatement with guarded transitions", async function () {
    const { issuer, other, registry } = await deploy();
    await registry.authorizeIssuer(issuer.address);
    await registry.connect(issuer).issueCredential(credentialId, commitment);
    await expectRevert(registry.connect(other).suspendCredential(credentialId), /AccessControlUnauthorizedAccount/);
    await registry.connect(issuer).suspendCredential(credentialId);
    assert.equal((await registry.credentialProof(credentialId)).status, 1n);
    await expectRevert(registry.connect(issuer).suspendCredential(credentialId), /InvalidStatusTransition/);
    await registry.connect(issuer).reinstateCredential(credentialId);
    assert.equal((await registry.credentialProof(credentialId)).status, 0n);
  });

  it("makes revocation terminal", async function () {
    const { issuer, registry } = await deploy();
    await registry.authorizeIssuer(issuer.address);
    await registry.connect(issuer).issueCredential(credentialId, commitment);
    await registry.connect(issuer).revokeCredential(credentialId);
    assert.equal((await registry.credentialProof(credentialId)).status, 2n);
    await expectRevert(registry.connect(issuer).reinstateCredential(credentialId), /InvalidStatusTransition/);
    await expectRevert(registry.connect(issuer).suspendCredential(credentialId), /InvalidStatusTransition/);
    await expectRevert(registry.connect(issuer).revokeCredential(credentialId), /InvalidStatusTransition/);
  });

  it("rejects lifecycle changes and lookups for unknown credentials", async function () {
    const { issuer, registry } = await deploy();
    await registry.authorizeIssuer(issuer.address);
    await expectRevert(registry.credentialProof(credentialId), /CredentialNotFound/);
    await expectRevert(registry.connect(issuer).suspendCredential(credentialId), /CredentialNotFound/);
    await expectRevert(registry.connect(issuer).reinstateCredential(credentialId), /CredentialNotFound/);
    await expectRevert(registry.connect(issuer).revokeCredential(credentialId), /CredentialNotFound/);
    assert.equal(await registry.hasCredential(credentialId), false);
  });
});
