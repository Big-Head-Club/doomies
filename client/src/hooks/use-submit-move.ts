import {BATTLE_ADDRESS} from '../utils/env'
import Battle from '../abi/Battle.json'
import {useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import {debug} from '../utils/debug'
import type {SquareCoords} from '../utils/squares'
import type {PieceId} from '../utils/pieces'
import {useGame} from '../contexts/GameContext'

export const useSubmitMove = (pieceId: PieceId, dxdy: SquareCoords) => {
  const {moves, turn, gameId} = useGame()

  const {config} = usePrepareContractWrite({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    functionName: 'move',
    args: [pieceId, ...dxdy],
  })

  const {write, data} = useContractWrite({
    ...config,
    onSuccess(data) {
      debug('move successful', data)
    },
    onError(error) {
      debug('mint error', error)
    },
  })

  const {isLoading, isSuccess, isError} = useWaitForTransaction({
    hash: data?.hash,
  })

  const hasMoved = moves.some(m =>
    m.game === gameId
    && m.turn === turn
    && m.pieceId === pieceId,
  )

  return {write, isLoading, isSuccess, isError, hasMoved}
}
