// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/// @title ComplianceCertificate
/// @notice ERC-721 certificate minted by CapCheck when a company's
///         compliance status is settled on-chain.  The certificate encodes
///         the company address, reporting year, and the settled boolean
///         result (compliant/non-compliant) as immutable on-chain metadata.
///
///         Token ID scheme: keccak256(abi.encodePacked(company, year)) cast
///         to uint256.  This gives each (company, year) pair a deterministic,
///         collision-resistant ID while keeping the mint idempotent.
contract ComplianceCertificate {
    // ─── ERC-721 minimal storage ─────────────────────────────────────────

    string public name = "CovertMRV Compliance Certificate";
    string public symbol = "CMRV-CERT";

    // tokenId => owner
    mapping(uint256 => address) private _owners;
    // tokenId => approved
    mapping(uint256 => address) private _tokenApprovals;
    // owner => operator => approved
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    // owner => balance
    mapping(address => uint256) private _balances;

    // ─── Certificate metadata ────────────────────────────────────────────

    struct Certificate {
        address company;
        uint256 reportingYear;
        bool compliant;
        uint256 issuedAt;
    }

    mapping(uint256 => Certificate) public certificates;

    // ─── Access control ──────────────────────────────────────────────────

    address public capCheck;   // minter (CapCheck contract)
    address public owner;      // protocol owner

    // ─── Events ──────────────────────────────────────────────────────────

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner_, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner_, address indexed operator, bool approved);
    event CertificateMinted(
        address indexed company,
        uint256 indexed tokenId,
        uint256 reportingYear,
        bool compliant
    );

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Admin ───────────────────────────────────────────────────────────

    /// @notice Set the CapCheck contract as the authorised minter.
    ///         Called once by the owner after deploying CapCheck.
    function setCapCheck(address _capCheck) external {
        require(msg.sender == owner, "Only owner");
        require(_capCheck != address(0), "zero address");
        capCheck = _capCheck;
    }

    // ─── Mint (called by CapCheck) ────────────────────────────────────────

    /// @notice Mint a compliance certificate for a company + reporting year.
    ///         If a certificate for the same (company, year) already exists
    ///         (re-check scenario) the existing token is simply returned.
    /// @param _company      Company address.
    /// @param _reportingYear Reporting year (e.g. 2025).
    /// @param _compliant    True = emissions ≤ cap.
    /// @return tokenId      Deterministic token ID.
    function mintCertificate(
        address _company,
        uint256 _reportingYear,
        bool _compliant
    ) external returns (uint256 tokenId) {
        require(msg.sender == capCheck, "Only CapCheck");
        require(_company != address(0), "zero company");

        tokenId = uint256(keccak256(abi.encodePacked(_company, _reportingYear)));

        // Idempotent: if already minted for this period, update metadata only.
        if (_owners[tokenId] == address(0)) {
            _owners[tokenId] = _company;
            _balances[_company] += 1;
            emit Transfer(address(0), _company, tokenId);
        }

        certificates[tokenId] = Certificate({
            company: _company,
            reportingYear: _reportingYear,
            compliant: _compliant,
            issuedAt: block.timestamp
        });

        emit CertificateMinted(_company, tokenId, _reportingYear, _compliant);
    }

    // ─── ERC-721 view functions ───────────────────────────────────────────

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "zero address");
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "nonexistent token");
        return tokenOwner;
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_owners[tokenId] != address(0), "nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address _owner, address operator) external view returns (bool) {
        return _operatorApprovals[_owner][operator];
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = _owners[tokenId];
        require(msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender], "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        address tokenOwner = _owners[tokenId];
        require(
            msg.sender == tokenOwner ||
            msg.sender == _tokenApprovals[tokenId] ||
            _operatorApprovals[tokenOwner][msg.sender],
            "Not authorized"
        );
        require(tokenOwner == from, "Not owner");
        require(to != address(0), "zero to");

        delete _tokenApprovals[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        this.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata) external {
        this.transferFrom(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC-721
            interfaceId == 0x01ffc9a7;   // ERC-165
    }

    /// @notice Convenience view: get certificate by (company, year).
    function getCertificate(
        address _company,
        uint256 _reportingYear
    ) external view returns (Certificate memory) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_company, _reportingYear)));
        require(_owners[tokenId] != address(0), "No certificate");
        return certificates[tokenId];
    }

    /// @notice Compute the deterministic token ID for a given (company, year).
    function tokenIdFor(address _company, uint256 _reportingYear) external pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_company, _reportingYear)));
    }
}
