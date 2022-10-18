import {useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import {BATTLE_ADDRESS} from '../utils/env'
import Battle from '../abi/Battle.json'
import {debug} from '../utils/debug'
import {useGame} from '../contexts/GameContext'
import {useEffect} from 'react'

export const useJoinGame = (tokenId: number, x: number, y: number) => {
  const {board, setPlayerPiece} = useGame()

  const {config} = usePrepareContractWrite({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    functionName: 'enterGame',
    args: [tokenId, x, y],
  })

  const {write, data} = useContractWrite({
    ...config,
    onSuccess(data) {
      debug('entered the game successfully', data)
    },
    onError(error) {
      debug('failed to enter game', error)
    },
  })

  const {isLoading, isSuccess, isError} = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    if (isSuccess) {
      setPlayerPiece()
    }
  }, [isSuccess, setPlayerPiece, board])

  return {write, isLoading, isSuccess, isError}
}
