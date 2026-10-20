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

## System Architecture

The project currently includes a React frontend, an Express authentication API,
and an independently developed Solidity smart contract. Supabase Auth login,
student signup, session restoration, and backend-verified profile roles are
implemented. Credential workflows still use browser-local demonstration data,
and the frontend does not submit transactions to or read data from the contract.

```mermaid
flowchart TD
    I[Institution User] --> F[React Frontend]
    S[Student User] --> F
    V[Public Verifier] --> F

    F --> A[Supabase Auth / Opt-in Demo Auth]
    A --> B[Express API: Verify Token + Resolve Profile Role]
    B --> D[Supabase]
    F --> C[Credential Management UI]
    C --> L[Browser Local Storage]
    C --> H[Browser SHA-256 Hashing]
    H --> Q[Local Integrity Check]

    J[Solidity Smart Contract] --> R[Issuer Authorization]
    J --> G[Credential Commitment Registry]
    J --> X[Suspend / Reinstate / Revoke]
    T[Hardhat Tests] --> J

    L -. "Not connected" .-> J

```

### Frontend

- The institution interface demonstrates credential management and issuance
  workflows.
- The student interface displays credentials for a demo student account.
- The public verification interface checks credentials against locally stored
  demonstration data.
- Browser local storage holds the demo records, and browser SHA-256 hashing is
  used to demonstrate local integrity checking.
- Supabase Auth is the default authentication path when configured. The
  backend verifies access tokens and resolves roles from `public.profiles`;
  browser-supplied roles are not trusted.
- A user may sign up as a student. Institution profiles must be provisioned
  through a trusted administrator process; public signup cannot grant
  institution privileges.
- Demo authentication remains available only when explicitly enabled with
  `VITE_EDUCHAIN_DEMO_MODE=true`; it is separate from Supabase Auth and is not
  production-grade authentication.
- The frontend demo accounts are `student.demo@example.test` /
  `StudentDemo@123` and `institution.demo@example.test` /
  `InstitutionDemo@123`. Session storage holds only the role and an eight-hour
  expiry; passwords are never stored in browser storage.
- The student account includes the synthetic `EDU-DEMO-STUDENT-001` record
  (`DEMO / LOCAL ONLY`). Its matching local SHA-256 hash does not establish
  issuer authenticity and is not blockchain-backed verification.

### Blockchain

The Solidity registry is developed and tested separately from the frontend.
It demonstrates issuer authorization, duplicate-resistant registration of
credential commitments, and credential suspension, reinstatement, and
revocation.

### Current Limitations

- Browser-local records are not shared across devices.
- A matching local hash demonstrates integrity only; it does not prove that an
  authorized institution genuinely issued the credential.
- The frontend is not connected to the smart contract and does not verify
  issuer authorization or credential status against an on-chain registry.
- The initial and hardening database migrations have not been validated or
  applied to the Supabase project. Authentication can verify a Supabase user,
  but role-based application access remains blocked until the schema and
  profile policies are validated and provisioned.
- Credential records and workflows remain browser-local; this milestone does
  not implement credential issuance or blockchain verification.

## Project Structure

```text
EduChain/
├── frontend/    # React + TypeScript + Vite application
├── blockchain/  # Solidity smart contract, tests and scripts
├── backend/     # Express API and Supabase auth verification
├── database/    # Supabase schema migrations (not yet applied)
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

- The frontend uses Supabase Auth when configured; opt-in demo authentication
  remains available for local presentations. Credential data remains
  browser-local.
- Frontend credential verification demonstrates local hash-integrity checking; it is not yet connected to a live blockchain registry.
- The Solidity contract and its tests are maintained separately under `blockchain/`.
- The backend verifies Supabase access tokens and resolves a user's application
  role from the profile table. Database role lookup fails closed when the
  expected schema or policies are unavailable.
- The database schema has not been validated or applied. This is an initial
  authentication milestone, not a production-ready identity or credential
  service.

**Important:** The current prototype does not establish real-world credential authenticity, production-grade identity verification, or cross-device verification.

## Running the Project

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

Copy `frontend/.env.example` to `frontend/.env.local` and
`backend/.env.example` to `backend/.env`, then configure the Supabase project
URL and publishable key. Use the same Supabase project in the frontend and
backend; never put a service-role key in the frontend.
Migrations must be validated and applied separately by a database owner before
profile-based application access can work. See [database/README.md](./database/README.md).

Start the API and frontend in separate terminals from the project root:

```bash
pnpm api:dev
```

```bash
pnpm dev
```

Use the local URL printed by Vite to open the frontend in your browser.
Vite forwards `/api` requests to the API on port `3001` during development.

The local demo login and protected demo workspaces are disabled by default.
To enable them for a local presentation, set
`VITE_EDUCHAIN_DEMO_MODE=true` in `frontend/.env.local` before starting Vite.
Demo mode takes precedence over Supabase and is not a production auth method.

## Smart Contract Tests

From the project root:

```bash
pnpm run contracts:test
```

## Future Scope

- Connect the frontend to a deployed smart contract.
- Provision institutional profiles through a trusted administrator workflow.
- Validate and apply the database migrations, then complete database-backed
  application workflows.
- Integrate QR-based verification with verifiable credential proofs.
- Conduct security, privacy, and usability testing.

## Status

Academic prototype under development.