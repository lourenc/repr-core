// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract SoulBoundToken is ERC721, AccessControl {
    /**
        Storage
    */

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(uint256 => address) public multisigOwner;

    uint256 public nextTokenId;

    /**
        Errors
     */

    error AddressEqZero();

    error CallerNotMultisigOwner(address _caller, uint256 _tokenId);

    error Inaccessible();

    /**
        External functions
     */

    constructor() ERC721("SoulBoundToken", "SBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address _multisigOwner, address _recipient) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (_recipient == address(0)) revert AddressEqZero();

        tokenId = nextTokenId++;

        _safeMint(_recipient, tokenId);

        multisigOwner[tokenId] = _multisigOwner;
    }

    function burn(uint256 _tokenId) external {
        _requireOwned(_tokenId);

        if (msg.sender != multisigOwner[_tokenId]) revert CallerNotMultisigOwner(msg.sender, _tokenId);

        _burn(_tokenId);
    }

    /**
        Lock of transfer
     */

    function transferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/) public virtual override {
        revert Inaccessible();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
