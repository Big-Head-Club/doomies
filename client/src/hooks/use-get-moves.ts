import {useEffect, useState} from 'react'
import {useProvider, useContract} from 'wagmi'
import Battle from '../abi/Battle.json'
import {BATTLE_ADDRESS} from '../utils/env'
import {useGame} from '../contexts/GameContext'
import {parseMoveEvent} from '../utils/events'
import type {RawMoveEvent} from '../utils/events'
import type {Contract} from 'ethers'
export const useGetMoves = () => {
  const provider = useProvider()

  const {updateMoves, gameId} = useGame()
  const [isInitialized, setIsInitialized] = useState(false)

  const contract: Contract = useContract({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    signerOrProvider: provider,
  })

  useEffect(() => {
    if (gameId == null) {
      return
    }

    let listener: (...args: any[]) => void
    if (isInitialized) {
      listener = (...rmve: any[]) => {
        updateMoves(ms => [
          ...ms,
          parseMoveEvent(
            rmve[6].blockNumber,
            rmve[6].logIndex,
            rmve.slice(0, 6) as RawMoveEvent),
        ])
      }

      contract.on('Move', listener)
    } else {
      (async () => {
        // We can pass in `fromBlock` and `toBlock` as second and third arguments.
        // We may need to do this for efficiency.
        const moves = (await contract.queryFilter('Move'))
          .filter(({args}) => args && args[3] === gameId)
          .map(re => parseMoveEvent(re.blockNumber, re.logIndex, re.args as RawMoveEvent))

        updateMoves(() => moves)
        setIsInitialized(true)
      })()
    }

    return () => {
      if (listener) {
        contract.off('Move', listener)
      }
    }
  }, [contract, updateMoves, gameId, isInitialized])
}
