// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract EduChainRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum Status {
        Active,
        Suspended,
        Revoked
    }

    struct CredentialProof {
        bytes32 commitment;
        address issuer;
        uint64 issuedAt;
        Status status;
        bool exists;
    }

    mapping(bytes32 credentialIdHash => CredentialProof proof) private _proofs;

    error ZeroAddress();
    error ZeroCredentialId();
    error ZeroCommitment();
    error DuplicateCredential(bytes32 credentialIdHash);
    error CredentialNotFound(bytes32 credentialIdHash);
    error InvalidStatusTransition(Status currentStatus, Status requestedStatus);

    event IssuerAuthorizationChanged(address indexed issuer, bool authorized);
    event CredentialIssued(
        bytes32 indexed credentialIdHash,
        bytes32 indexed commitment,
        address indexed issuer,
        uint64 issuedAt
    );
    event CredentialStatusChanged(
        bytes32 indexed credentialIdHash,
        Status previousStatus,
        Status newStatus,
        address indexed actor
    );

    constructor(address administrator) {
        if (administrator == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, administrator);
        _grantRole(ADMIN_ROLE, administrator);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ISSUER_ROLE, ADMIN_ROLE);
    }

    function grantRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        if (account == address(0)) revert ZeroAddress();
        if (role == ISSUER_ROLE) {
            _grantRole(role, account);
            emit IssuerAuthorizationChanged(account, true);
            return;
        }
        super.grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        if (account == address(0)) revert ZeroAddress();
        if (role == ISSUER_ROLE) {
            _revokeRole(role, account);
            emit IssuerAuthorizationChanged(account, false);
            return;
        }
        super.revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address callerConfirmation) public override {
        if (role == ISSUER_ROLE) revert AccessControlUnauthorizedAccount(msg.sender, ADMIN_ROLE);
        super.renounceRole(role, callerConfirmation);
    }

    function authorizeIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        if (issuer == address(0)) revert ZeroAddress();
        _grantRole(ISSUER_ROLE, issuer);
        emit IssuerAuthorizationChanged(issuer, true);
    }

    function revokeIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        if (issuer == address(0)) revert ZeroAddress();
        _revokeRole(ISSUER_ROLE, issuer);
        emit IssuerAuthorizationChanged(issuer, false);
    }

    function issueCredential(bytes32 credentialIdHash, bytes32 commitment)
        external
        onlyRole(ISSUER_ROLE)
    {
        if (credentialIdHash == bytes32(0)) revert ZeroCredentialId();
        if (commitment == bytes32(0)) revert ZeroCommitment();
        if (_proofs[credentialIdHash].exists) {
            revert DuplicateCredential(credentialIdHash);
        }

        uint64 issuedAt = uint64(block.timestamp);
        _proofs[credentialIdHash] = CredentialProof({
            commitment: commitment,
            issuer: msg.sender,
            issuedAt: issuedAt,
            status: Status.Active,
            exists: true
        });
        emit CredentialIssued(credentialIdHash, commitment, msg.sender, issuedAt);
    }

    function suspendCredential(bytes32 credentialIdHash) external onlyRole(ISSUER_ROLE) {
        _changeStatus(credentialIdHash, Status.Suspended);
    }

    function reinstateCredential(bytes32 credentialIdHash) external onlyRole(ISSUER_ROLE) {
        _changeStatus(credentialIdHash, Status.Active);
    }

    function revokeCredential(bytes32 credentialIdHash) external onlyRole(ISSUER_ROLE) {
        _changeStatus(credentialIdHash, Status.Revoked);
    }

    function credentialProof(bytes32 credentialIdHash)
        external
        view
        returns (
            bytes32 commitment,
            address issuer,
            uint64 issuedAt,
            Status status
        )
    {
        CredentialProof storage proof = _proofs[credentialIdHash];
        if (!proof.exists) revert CredentialNotFound(credentialIdHash);
        return (proof.commitment, proof.issuer, proof.issuedAt, proof.status);
    }

    function hasCredential(bytes32 credentialIdHash) external view returns (bool) {
        return _proofs[credentialIdHash].exists;
    }

    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return hasRole(ISSUER_ROLE, issuer);
    }

    function _changeStatus(bytes32 credentialIdHash, Status requestedStatus) private {
        CredentialProof storage proof = _proofs[credentialIdHash];
        if (!proof.exists) revert CredentialNotFound(credentialIdHash);
        if (proof.status == Status.Revoked || proof.status == requestedStatus) {
            revert InvalidStatusTransition(proof.status, requestedStatus);
        }

        Status previousStatus = proof.status;
        proof.status = requestedStatus;
        emit CredentialStatusChanged(credentialIdHash, previousStatus, requestedStatus, msg.sender);
    }
}
