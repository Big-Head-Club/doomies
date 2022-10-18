// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IBattleDice {
    function rollPlayerStats() external view returns (int8[7] memory stats);

    function rollWeaponStats(uint32 salt)
        external
        view
        returns (int8[7] memory stats);

    function battle(
        uint32 player1,
        uint32 player2,
        int8[7] memory stats1,
        int8[7] memory weapon1,
        int8[7] memory stats2,
        int8[7] memory weapon2
    )
        external
        view
        returns (
            uint32 victor,
            int256[8] memory rolls1,
            int256[8] memory rolls2
        );
}
