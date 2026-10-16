# Local contract development

This guide covers the currently implemented Solidity registry only. The React
application remains a separately labeled browser-local demo; no backend,
MongoDB persistence, wallet-connected frontend issuance, or connected
verification flow has been integrated yet.

## Requirements

- Node.js supported by this workspace (the implementation was checked with Node
  24.16.0).
- pnpm 11.
- Dependencies installed with `pnpm install`.

Hardhat uses Solidity 0.8.24 and a local chain ID of 31337. The contract stores
only a hashed credential identifier, salted commitment, issuer address,
issuance time and lifecycle status. Personal or academic data and commitment
salts must remain off-chain. A commitment should be SHA-256 over a canonical
payload and a cryptographically random per-credential salt, encoded
unambiguously by the future issuing service.

## Compile and test

Run these commands from the workspace root. The contract, tests, and scripts
live in the `blockchain/` workspace package.

```powershell
pnpm install
pnpm run contracts:compile
pnpm run contracts:test
```

The tests run on Hardhat's in-memory local chain and do not require MongoDB,
external RPC access, MetaMask, or a deployed contract.

## Deploy and authorize a development issuer

Start a local node in one terminal and leave it running:

```powershell
pnpm run contracts:node
```

In a second terminal:

```powershell
pnpm run contracts:deploy:local
```

Copy the deployment address printed by the command. The deployer (development
account 0) is the administrator. To deliberately authorize development account
1, set the deployment address and run:

```powershell
$env:EDUCHAIN_CONTRACT_ADDRESS = "0x<deployed-address>"
pnpm run contracts:authorize-local-issuer
```

The helper refuses to run unless the configured network is the local Hardhat
node with chain ID 31337. The issuer account is the second account exposed by
that local node. Hardhat's publicly known development keys are for local use
only and must never be used on a public network.

The local node is ephemeral: restarting it clears its chain state and requires
redeployment and reauthorization. No public-network deployment is configured
or performed by these scripts.

## Lifecycle and authorization

- `ADMIN_ROLE` authorizes or revokes `ISSUER_ROLE` members.
- An authorized issuer submits `issueCredential` with a non-zero identifier
  hash and salted commitment. The contract rejects duplicates.
- An authorized issuer may suspend an active credential, reinstate a
  suspended credential, or revoke a non-revoked credential.
- Revocation is terminal. Issuer authorization is checked at the time of each
  transaction; revoking an issuer does not erase proofs already recorded.
- `credentialProof`, `hasCredential` and `isAuthorizedIssuer` are read-only
  lookups. A missing proof causes `credentialProof` to revert with
  `CredentialNotFound`.

The registry does not create credential IDs, canonical payloads, salts, or
commitments. It cannot validate the meaning or academic correctness of a
commitment; those checks belong to the not-yet-implemented backend and issuer
workflow.
