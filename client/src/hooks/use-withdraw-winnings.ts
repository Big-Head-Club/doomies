import {BATTLE_ADDRESS} from '../utils/env'
import Battle from '../abi/Battle.json'
import {useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import {debug} from '../utils/debug'

export const useWithdrawWinnings = (pieceId: number) => {
  const {config} = usePrepareContractWrite({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    functionName: 'withdrawWinnings',
    args: [pieceId],
  })

  const {write, data} = useContractWrite({
    ...config,
    onSuccess(data) {
      debug('withdraw successful', data)
    },
    onError(error) {
      debug('withdraw error', error)
    },
  })

  const {isLoading, isSuccess, isError} = useWaitForTransaction({
    hash: data?.hash,
  })

  return {write, isLoading, isSuccess, isError}
}
