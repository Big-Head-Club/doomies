import type {BigNumber} from 'ethers'
import {useCallback, useEffect, useState} from 'react'
import {useAccount, useContractEvent, useContractRead} from 'wagmi'
import BattleViewer from '../abi/BattleViewer.json'
import Battle from '../abi/Battle.json'
import {useGame} from '../contexts/GameContext'
import {debug, err} from '../utils/debug'
import {BATTLE_ADDRESS, VIEWER_ADDRESS} from '../utils/env'
import type {Result} from 'ethers/lib/utils'

export const useGetMyTokens = () => {
  const {setPlayerTokens, moves} = useGame()
  const {address} = useAccount()
  const [initialized, setInitialized] = useState(false)

  const onSuccess = useCallback((data: Result) => {
    if (address == null) {
      return
    }

    setPlayerTokens(data.map((toks: BigNumber[]) =>
      toks.map(t => t.toNumber()).filter(t => t !== 0)) as [number[], number[]],
    )
  }, [setPlayerTokens, address])

  const result = useContractRead({
    addressOrName: VIEWER_ADDRESS,
    contractInterface: BattleViewer,
    functionName: 'getMyTokens',
    args: [1, 801],
    onError() {
      err('error getting player tokens, is your wallet connected?')
    },
    onSuccess(data) {
      if (initialized) {
        return
      }

      onSuccess(data)
      setInitialized(true)
    },
    overrides: {from: address},
  })

  const {refetch} = result

  useContractEvent({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    eventName: 'Mint',
    listener() {
      refetch()
        .then(({data}) => {
          debug('refetched tokens due to mint event', data)
          onSuccess(data!)
        })
        .catch(({error}) => {
          err('error refetching tokens due to mint event', error)
        })
    },
  })

  // Refetch in case of address change OR
  // in case of new Move events (user may have joined a game, which means a token went from available to spent)
  useEffect(() => {
    refetch()
      .then(({data}) => {
        debug('refetched tokens due to address change or move event', data)
        onSuccess(data!)
      })
      .catch(({error}) => {
        err('error refetching tokens due to address change or move event', error)
      })
  }, [refetch, address, moves, onSuccess])

  return result
}
