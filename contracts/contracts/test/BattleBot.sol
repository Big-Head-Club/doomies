// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BattleBot {
    address battle;

    constructor(address _battle) {
        battle = _battle;
    }

    function mint() public payable {
        BattleBot(battle).mint();
    }

    function enterGame(int8 startX, int8 startY) public payable {
        BattleBot(battle).enterGame{value: msg.value}(startX, startY);
    }

    function move(
        uint32 tokenId,
        int8 dx,
        int8 dy
    ) public {
        BattleBot(battle).move(tokenId, dx, dy);
    }
}
