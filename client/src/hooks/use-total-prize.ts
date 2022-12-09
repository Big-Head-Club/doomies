import type {Contract} from 'ethers'
import {useEffect, useState} from 'react'
import {useContract, useProvider} from 'wagmi'
import {useGame} from '../contexts/GameContext'
import {PLAYER} from '../utils/constants'
import {BATTLE_ADDRESS} from '../utils/env'
import {totalPrize} from '../utils/prize'
import Battle from '../abi/Battle.json'

// eslint-disable-next-line
// const FEE_ENTRY = 0.08
// Free play
const FEE_ENTRY = 0.00
// eslint-disable-next-line
const CONTRACT_PCT = 51

type Withdrawal = {
  pieceId: number;
  gameId: number;
  amount: number;
}

export const useTotalPrize = () => {
  const {pieces, gameId} = useGame()
  const [isInitialized, setIsInitialized] = useState(false)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [totalPrizeNum, setTotalPrizeNum] = useState<number | undefined>()
  const provider = useProvider()

  const allPlayers = pieces
    ? Object.values(pieces).filter(p => p.pieceType === PLAYER)
    : undefined

  //  useEffect(() => {
  //    console.log('total prize', totalPrizeNum)
  //    console.log('all players', allPlayers?.length)
  //    console.log('entry fee', FEE_ENTRY)
  //    console.log('contract pct', CONTRACT_PCT)
  //  }, [totalPrizeNum, allPlayers, FEE_ENTRY])
  useEffect(() => {
    if (allPlayers == null) {
      return
    }

    const tp = totalPrize(FEE_ENTRY, allPlayers.length, CONTRACT_PCT)
    setTotalPrizeNum(t =>
      t == null
        ? tp
        : tp - withdrawals.reduce((sum, {amount}) => sum + amount, 0),
    )
  }, [withdrawals, allPlayers])

  const contract: Contract = useContract({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    signerOrProvider: provider,
  })

  const parseWithdrawal = (w: [number, number, number]): Withdrawal =>
    ({
      pieceId: w[0],
      gameId: w[1],
      amount: w[2] / 1000000000000000000,
    })

  useEffect(() => {
    if (gameId == null) {
      return
    }

    let listener: (...args: any[]) => void
    if (isInitialized) {
      listener = (...we: any[]) => {
        setWithdrawals(w => [
          ...w,
          parseWithdrawal(we as [number, number, number]),
        ])
      }

      contract.on('WithdrawWinnings', listener)
    } else {
      (async () => {
        // We can pass in `fromBlock` and `toBlock` as second and third arguments.
        // We may need to do this for efficiency.
        const ws = (await contract.queryFilter('WithdrawWinnings'))
          .filter(({args}) => args && args[2] === gameId)
          .map(we => parseWithdrawal(we.args as [number, number, number]))

        setWithdrawals(() => ws)
        setIsInitialized(true)
      })()
    }

    return () => {
      if (listener) {
        contract.off('WithdrawWinnings', listener)
      }
    }
  }, [contract, setWithdrawals, gameId, isInitialized])

  return totalPrizeNum
    ? totalPrizeNum.toFixed(4).toString() + ' MATIC'
    : ''
}
