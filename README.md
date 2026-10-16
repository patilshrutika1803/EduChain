# EduChain
### Privacy-Aware Blockchain Platform for Verifiable Educational Credentials

EduChain is a prototype framework designed to demonstrate how blockchain technology and cryptographic hashing can support the integrity and verification of educational credentials in India.

## Problem Statement

**Design and Implementation of a Blockchain-Enabled Framework for Secure Educational Credentials in India.**

Traditional educational credentials can be difficult to verify efficiently and may be vulnerable to forgery or unauthorized modification. EduChain explores a privacy-aware approach to credential issuance and verification.

## Key Features

- **Institution Dashboard:** Demonstrates an institution-facing credential management interface.
- **Credential Issuance:** Provides a UI workflow for issuing educational credentials.
- **Student Wallet:** Displays credentials associated with a demo student account.
- **Credential Verification:** Demonstrates hash-based integrity checking.
- **Blockchain Registry:** Includes a Solidity smart contract for credential commitments and issuer authorization.
- **Credential Lifecycle:** The contract supports suspension, reinstatement, and revocation.
- **Privacy-Aware Design:** The smart contract stores credential commitments and related metadata rather than students' personal details.

## Project Structure

```text
EduChain/
├── frontend/    # React + TypeScript + Vite application
├── blockchain/  # Solidity smart contract, tests and scripts
├── backend/     # Documentation placeholder
├── database/    # Documentation placeholder
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Development Tools:** Git, GitHub, pnpm

## Project Scope

EduChain is currently a **UI prototype and blockchain development demonstration**.

- The frontend uses browser-local demo authentication and local storage.
- Frontend credential verification demonstrates local hash-integrity checking; it is not yet connected to a live blockchain registry.
- The Solidity contract and its tests are maintained separately under `blockchain/`.
- The backend and database folders contain documentation placeholders; no production backend or database integration is implemented.

**Important:** The current prototype does not establish real-world credential authenticity, production-grade identity verification, or cross-device verification.

## Running the Project

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

From the project root:

```bash
pnpm install
pnpm run dev
```

Use the local URL printed by Vite to open the frontend in your browser.

## Smart Contract Tests

From the project root:

```bash
pnpm run contracts:test
```

## Future Scope

- Connect the frontend to a deployed smart contract.
- Implement secure institutional authentication.
- Add backend services and persistent storage.
- Integrate QR-based verification with verifiable credential proofs.
- Conduct security, privacy, and usability testing.

## Status

Academic prototype under development.