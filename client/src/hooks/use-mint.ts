import {BATTLE_ADDRESS} from '../utils/env'
import Battle from '../abi/Battle.json'
import {useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import {debug} from '../utils/debug'
import {ethers} from 'ethers'

export const useMint = () => {
  const {config} = usePrepareContractWrite({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    functionName: 'mint',
    overrides: {
      value: ethers.utils.parseEther('0.0005'), // @TODO: Move to environment variable
    },
  })

  const {write, data} = useContractWrite({
    ...config,
    onSuccess(data) {
      debug('mint successful', data)
    },
    onError(error) {
      debug('mint error', error)
    },
  })

  const {isLoading, isSuccess, isError} = useWaitForTransaction({
    hash: data?.hash,
  })

  return {write, isLoading, isSuccess, isError}
}
