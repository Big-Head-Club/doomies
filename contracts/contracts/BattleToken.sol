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
    string __uriBase;
    string __uriSuffix;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uriBase,
        string memory _uriSuffix
    ) ERC721(_name, _symbol) {
        __uriBase = _uriBase;
        __uriSuffix = _uriSuffix;
    }

    //Admin
    function setUriComponents(
        string calldata _newBase,
        string calldata _newSuffix
    ) public onlyOwner {
        __uriBase = _newBase;
        __uriSuffix = _newSuffix;
    }

    function setBattle(address _battle) public {
        require(battle == address(0), "already set");
        battle = _battle;
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
        return
            string(
                abi.encodePacked(__uriBase, _tokenId.toString(), __uriSuffix)
            );
    }


}
