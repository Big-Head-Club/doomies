import { useAccount } from 'wagmi'
import FakeDoomie from '../../assets/nft.png'
import { useWithdrawWinnings } from '../../hooks/use-withdraw-winnings'
import { useGame } from '../../contexts/GameContext'
import Button from '../Button'
import Block from '../Block'
import Connect from '../Connect'

type GameEndedBlockProps = {
  onClose: () => void;
}

export default function GameEndedBlock({ onClose }: GameEndedBlockProps) {
  // Only 1 player should remain for this block to show up
  const { isDisconnected } = useAccount()
  const { board, playerPiece } = useGame()
  const { write: withdraw, isLoading, isSuccess, isError } = useWithdrawWinnings(playerPiece!)

  return (
    <Block title={isDisconnected ? 'connect' : 'we have a winner!'} onClose={onClose}>
      <div className='flex justify-center items-center mt-auto'>
        {/* @TODO: Use winning players doomie image */}
        {/* <img src={FakeDoomie} /> */}
      </div>
      <div className='mt-auto w-full'>
        {isDisconnected
          ? <Connect />
          : playerPiece && Object.values(board).some(p => p === playerPiece)
            ? (
              <div />
              // UI reflects this is a free to play game
              // <Button
              //   text={isLoading
              //     ? 'withdrawing...'
              //     : isSuccess
              //       ? 'withdrawn!'
              //       : isError
              //         ? 'withdrawing error'
              //         : 'withdraw winnings'}
              //   isDisabled={!withdraw || isLoading}
              //   onClick={() => {
              //     withdraw?.()
              //   }}
              // />
            )
            : <Button isDisabled text='maybe next time...' />}
      </div>
    </Block>
  )
}
