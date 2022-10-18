// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Battle.sol";
import "./BattleToken.sol";

/// @author AnAllergyToAnalogy
/// @title Big Head Club Doomies Site Viewer Contract
/// @notice Just some read only stuff for the site
contract BattleViewer {
    constructor(address _battle, address _token) {
        battle = Battle(_battle);
        token = BattleToken(_token);
    }

    Battle battle;
    BattleToken token;

    // returns time in seconds until current turn ends
    function getTimeTilTurnEnds() public view returns (uint256) {
        uint16 game = battle.game();

        (
            uint32 startTime,
            uint16 lastBattle,
            uint8 players,
            uint8 remaining
        ) = battle.games(game);

        lastBattle;
        players;
        remaining;

        uint256 turnTime = battle.turnTime();

        return turnTime - ((block.timestamp - uint256(startTime)) % turnTime);
    }

    //returns full state of the current game
    function getCurrentGameState()
        public
        view
        returns (
            uint32[9][9] memory _board,
            uint16 game,
            uint16 turn,
            bool gameIsActive,
            uint256 timeTilTurnEnds,
            uint32 startTime,
            uint16 lastBattle,
            uint8 players,
            uint8 remaining
        )
    {
        game = battle.game();

        (startTime, lastBattle, players, remaining) = battle.games(game);

        uint256 turnTime = battle.turnTime();

        timeTilTurnEnds =
            turnTime -
            ((block.timestamp - uint256(startTime)) % turnTime);

        return (
            getCurrentBoard(),
            game,
            turnNumber(),
            battle.gameIsActive(),
            timeTilTurnEnds,
            startTime,
            lastBattle,
            players,
            remaining
        );
    }

    // returns a 9x9 array of current board, with ids of pieces
    function getCurrentBoard()
        public
        view
        returns (uint32[9][9] memory _board)
    {
        for (uint256 x = 0; x < 9; x++) {
            for (uint256 y = 0; y < 9; y++) {
                _board[x][y] = battle.getTile(int8(int256(x)), int8(int256(y)));
            }
        }

        return _board;
    }

    // pass an array of pieceIds, it will return an array of Pieces, including stats
    function getPieces(uint32[] calldata pieceIds)
        public
        view
        returns (Piece[] memory pieces)
    {
        pieces = new Piece[](pieceIds.length);

        for (uint256 i = 0; i < pieceIds.length; i++) {
            (
                uint32 id,
                uint32 data,
                uint8 data2,
                uint16 game,
                uint16 lastMove,
                PieceType pieceType,
                int8 x,
                int8 y
            ) = battle.pieces(pieceIds[i]);

            pieces[i] = Piece(
                id,
                data,
                data2,
                game,
                lastMove,
                pieceType,
                x,
                y,
                battle.getStats(pieceIds[i])
            );
        }

        return pieces;
    }

    //returns two arrays of tokenIds of your tokens, one of those which have been used, another of those which havent
    //note you have to pass startId, and limit. for this contract it should be fine to just us 1 and whatever the max
    //  number of tokens are
    // also note, the lengths of the arrays will be the users balance. meaning there will be a bunch of entries with 0
    //  in them at the end of the arrays. ignore these values
    function getMyTokens(uint256 startId, uint256 limit)
        public
        view
        returns (uint256[] memory unused, uint256[] memory used)
    {
        uint256 _totalSupply = battle.lastTokenId();
        uint256 _myBalance = token.balanceOf(msg.sender);

        uint256 _maxId = _totalSupply;

        if (_totalSupply == 0 || _myBalance == 0) {
            uint256[] memory _none;
            return (_none, _none);
        }

        require(startId < _maxId + 1, "Invalid start ID");
        uint256 sampleSize = _maxId - startId + 1;

        if (limit != 0 && sampleSize > limit) {
            sampleSize = limit;
        }

        unused = new uint256[](_myBalance);
        used = new uint256[](_myBalance);

        uint32 _tokenId = uint32(startId);
        uint256 unusedFound = 0;
        uint256 usedFound = 0;

        for (uint256 i = 0; i < sampleSize; i++) {
            try token.ownerOf(_tokenId) returns (address owner) {
                if (msg.sender == owner) {
                    if (battle.tokenIsUnused(_tokenId)) {
                        unused[unusedFound++] = _tokenId;
                    } else {
                        used[usedFound++] = _tokenId;
                    }
                }
            } catch {}
            _tokenId++;
        }
        return (unused, used);
    }

    function getMetadata(uint32 tokenId)
        public
        view
        returns (int8[7] memory playerStats, int8[7] memory weaponStats)
    {
        token.ownerOf(tokenId);
        (
            uint32 id,
            uint32 data,
            uint8 data2,
            uint16 game,
            uint16 lastMove,
            PieceType pieceType,
            int8 x,
            int8 y
        ) = battle.pieces(tokenId);

        id;data2;game;lastMove;pieceType;x;y;


        if (data == 0) {
            return (battle.getStats(tokenId), weaponStats);
        } else {
            return (battle.getStats(tokenId), battle.getStats(data));
        }
    }

    // returns the current turn number of the current game
    function turnNumber() internal view returns (uint16) {
        (
        uint32 startTime,
        uint16 lastBattle,
        uint8 players,
        uint8 remaining
        ) = battle.games(battle.game());
        remaining;lastBattle;players;

        uint256 turnTime = battle.turnTime();
        return uint16((block.timestamp - uint256(startTime)) / turnTime);
    }
}
