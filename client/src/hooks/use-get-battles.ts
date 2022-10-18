import {useEffect, useState} from 'react'
import {useProvider, useContract} from 'wagmi'
import Battle from '../abi/Battle.json'
import {BATTLE_ADDRESS} from '../utils/env'
import {useGame} from '../contexts/GameContext'
import {parseBattleLogEvent} from '../utils/events'
import type {RawBattleLogEvent, BattleLogEvent} from '../utils/events'
import type {Contract} from 'ethers'
import {useStorage} from '../contexts/StorageContext'

type AddBattleToStorageParams = {
  playerTokens?: {
    available: number[];
    spent: number[];
  };
  battle: BattleLogEvent;
  checkStale: (b: BattleLogEvent) => boolean;
  checkFresh: (b: BattleLogEvent) => boolean;
  updater: (cb: (bs: Array<{blockNumber: number; logIndex: number}>) => Array<{blockNumber: number; logIndex: number}>) => void;
}
const addBattleToStorage = ({playerTokens, battle, checkStale, checkFresh, updater}: AddBattleToStorageParams) => {
  // If this new battle involves the player, and its
  // not already stored, store it as a fresh battle.
  if (
    !checkStale(battle)
    && !checkFresh(battle)
    && playerTokens
    && playerTokens.spent.some(t => t === battle.player1 || t === battle.player2)
  ) {
    updater(bs => [
      ...bs,
      {blockNumber: battle.blockNumber, logIndex: battle.logIndex},
    ])
  }
}

export const useGetBattles = () => {
  const provider = useProvider()
  const {updateFreshBattles, isFreshBattle, isStaleBattle} = useStorage()
  const {updateBattleLogs, playerTokens, gameId} = useGame()
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
      listener = (...rble: any[]) => {
        const battle = parseBattleLogEvent(
          rble[7].blockNumber,
          rble[7].logIndex,
          rble.slice(0, 7) as RawBattleLogEvent,
        )

        addBattleToStorage({
          playerTokens,
          battle,
          checkStale: isStaleBattle,
          checkFresh: isFreshBattle,
          updater: updateFreshBattles,
        })

        updateBattleLogs(bls => [
          ...bls,
          battle,
        ])
      }

      contract.on('BattleLog', listener)
    } else {
      (async () => {
        // We can pass in `fromBlock` and `toBlock` as second and third arguments.
        // We may need to do this for efficiency.
        const battles = (await contract.queryFilter('BattleLog'))
          .filter(({args}) => args && args[6] === gameId)
          .map(re => parseBattleLogEvent(re.blockNumber, re.logIndex, re.args as RawBattleLogEvent))

        battles.forEach(battle => {
          addBattleToStorage({
            playerTokens,
            battle,
            checkStale: isStaleBattle,
            checkFresh: isFreshBattle,
            updater: updateFreshBattles,
          })
        })

        updateBattleLogs(() => battles)
        setIsInitialized(true)
      })()
    }

    return () => {
      if (listener) {
        contract.off('BattleLog', listener)
      }
    }
  }, [contract, updateBattleLogs, gameId, isInitialized])
}
