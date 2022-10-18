import type {GameState} from '../contexts/GameContext'
import {useGame} from '../contexts/GameContext'
import {VIEWER_ADDRESS, BATTLE_ADDRESS} from '../utils/env'
import {debug, err} from '../utils/debug'
import {useContractEvent, useContractRead} from 'wagmi'
import BattleViewer from '../abi/BattleViewer.json'
import Battle from '../abi/Battle.json'

export const useGetCurrentGameState = () => {
  const {setGame} = useGame()

  const onSuccess = (data: GameState) => {
    setGame(data)
  }

  const result = useContractRead({
    addressOrName: VIEWER_ADDRESS,
    contractInterface: BattleViewer,
    functionName: 'getCurrentGameState',
    watch: true,
    onSuccess(data) {
      onSuccess(data as GameState)
    },
  })

  const {refetch} = result

  useContractEvent({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    eventName: 'Mint',
    listener() {
      refetch()
        .then(({data}) => {
          debug('refetched game due to new game event', data)
          onSuccess(data as GameState)
        })
        .catch(({error}) => {
          err('error refetching game due to new game event', error)
        })
    },
  })

  return result
}
