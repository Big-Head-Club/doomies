import {useAccount} from 'wagmi'
import Block from '../Block'
import Button from '../Button'
import Connect from '../Connect'
import {useMint} from '../../hooks/use-mint'
import FakeDoomie from '../../assets/nft.png'
import {useEffect, useState} from 'react'
import {useGame} from '../../contexts/GameContext'

type BuyDoomieBlockProps = {
  onClose: () => void;
}

export default function BuyDoomieBlock({onClose}: BuyDoomieBlockProps) {
  const {isConnected} = useAccount()
  const {playerTokens} = useGame()
  const {write: mint, isLoading, isSuccess, isError} = useMint()
  const [reset, setReset] = useState(false)

  useEffect(() => {
    let id: NodeJS.Timeout | undefined
    if (isSuccess) {
      setReset(true)
      id = setTimeout(() => {
        setReset(false)
      }, 2000)
    }

    return () => {
      if (id) {
        clearTimeout(id)
      }
    }
  }, [isSuccess])

  // @FIXME: Block title should say `mint a doomie` if doomies are available to mint
  return (
    <Block title={isConnected ? 'buy a doomie' : 'buy a doomie'} onClose={onClose}>
      {playerTokens?.available && (
        <div className='flex justify-center items-center'>
            You have {playerTokens.available.length} unspent {playerTokens.available.length === 1 ? 'doomie' : 'doomies'}.
        </div>
      )}
      <div className='flex justify-center items-center mt-auto'>
        <img src={FakeDoomie}/>
      </div>
      <div className='mt-auto w-full'>
        {isConnected
          ? (
            <div className='flex gap-x-2'>
              {/* 
              
              // @TODO: Make this better for when the project mints out.

              <Button
                text={isLoading
                  ? 'minting...'
                  : reset
                    ? 'minted!'
                    : isError
                      ? 'minting error'
                      : 'mint'}
                isDisabled={!mint || isLoading || reset}
                onClick={() => {
                  mint?.()
                }}
              /> */}
              <Button
                text='play'
                isDisabled={!playerTokens?.available.length}
                onClick={() => {
                  onClose()
                }}
              />
            </div>
          )
          : <Connect/>}
      </div>
    </Block>
  )
}
