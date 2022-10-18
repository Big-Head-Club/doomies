import {useGame} from '../contexts/GameContext'
import type {ValueOf} from '../utils/types'

export const blockTypes = {
  piece: 'piece',
  buyDoomie: 'buy-doomie',
  selectDoomie: 'select-doomie',
  joinGame: 'join-game',
  gameOver: 'game-over',
  activity: 'activity',
  battle: 'battle',
}

type UseActiveBlocksParams = {
  refusedToMint: boolean;
  refusedToJoin: boolean;
  joinedGame: boolean;
  gameOver: boolean;
  activeGame?: boolean;
  battle?: number;
}

/* This hook returns a set so we can optionally show more than one block at the same time */
export function useActiveBlocks({joinedGame, refusedToMint, refusedToJoin, gameOver, activeGame, battle}: UseActiveBlocksParams): Set<ValueOf<typeof blockTypes>> {
  const {turn, playerTokens, pendingPlayerPiece, selectedPiece} = useGame()
  const activeBlocks = new Set<ValueOf<typeof blockTypes>>([])

  if (selectedPiece != null) {
    activeBlocks.add(blockTypes.piece)
    return activeBlocks
  }

  if (gameOver) {
    activeBlocks.add(blockTypes.gameOver)
    return activeBlocks
  }

  if (battle != null) {
    activeBlocks.add(blockTypes.battle)
    return activeBlocks
  }

  if (!refusedToJoin && !joinedGame && (turn === 0 || !activeGame)) {
    if (!refusedToMint) {
      activeBlocks.add(blockTypes.buyDoomie)
      return activeBlocks
    }

    if (pendingPlayerPiece == null && playerTokens) {
      activeBlocks.add(blockTypes.selectDoomie)
      return activeBlocks
    }

    if (pendingPlayerPiece != null) {
      activeBlocks.add(blockTypes.joinGame)
      return activeBlocks
    }
  }

  activeBlocks.add(blockTypes.activity)
  return activeBlocks
}
