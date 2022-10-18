// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @author AnAllergyToAnalogy
/// @title Big Head Club Doomies Token Contract
/// @notice Handles all the ERC721 token stuff of the Doomies tokens.
/// @dev The actual token address will point at this contract. Mints can only be done via main contract.
contract BattleToken is ERC721, Ownable {
    using Strings for uint256;

    address battle;
    string __aliveUriBase;
    string __aliveUriSuffix;
    string __deadUriBase;
    string __deadUriSuffix;
    mapping(uint256 => bool) public deadTokens;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _aliveUriBase,
        string memory _aliveUriSuffix,
        string memory _deadUriBase,
        string memory _deadUriSuffix
    ) ERC721(_name, _symbol) {
        __aliveUriBase = _aliveUriBase;
        __aliveUriSuffix = _aliveUriSuffix;
        __deadUriBase = _deadUriBase;
        __deadUriSuffix = _deadUriSuffix;
    }

    //Admin
    function setUriComponents(
        string calldata _aliveNewBase,
        string calldata _aliveNewSuffix,
        string calldata _deadNewBase,
        string calldata _deadNewSuffix
    ) public onlyOwner {
        __aliveUriBase = _aliveNewBase;
        __aliveUriSuffix = _aliveNewSuffix;
        __deadUriBase = _deadNewBase;
        __deadUriSuffix = _deadNewSuffix;
    }

    function setBattle(address _battle) public {
        require(battle == address(0), "already set");
        battle = _battle;
    }

    function killDoomie(uint256 tokenId) public {
      require(msg.sender == battle, "permission");
      deadTokens[tokenId] = true;
    }

    function mint(address to, uint256 tokenId) public {
        require(msg.sender == battle, "permission");
        _mint(to, tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "exists");
        if (deadTokens[_tokenId]) {
          return string(abi.encodePacked(__deadUriBase, _tokenId.toString(), __deadUriSuffix));
        }
        return string(abi.encodePacked(__aliveUriBase, _tokenId.toString(), __aliveUriSuffix));
    }


}
