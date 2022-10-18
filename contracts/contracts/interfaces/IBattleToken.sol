// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IBattleToken {
    function mint(address to, uint256 tokenId) external;

    function burn(uint256 tokenId) external;

    function ownerOf(uint256 tokenId) external view returns (address);
}
