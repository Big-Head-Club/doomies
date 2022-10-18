import type {MouseEventHandler} from 'react'
import {useEffect, useState} from 'react'
import FakeDoomie from '../../assets/nft.png'
import {useGame} from '../../contexts/GameContext'
import type {SquareId} from '../../utils/squares'
import {decodeSquareId, encodeSquareId} from '../../utils/squares'
import {useJoinGame} from '../../hooks/use-join-game'
import Block from '../Block'
import Button from '../Button'
import {PLAYER} from '../../utils/constants'
import {getPieceImage} from '../../utils/pieces'

const initialSquares = [
  [0, 0],
  [2, 0],
  [4, 0],
  [6, 0],
  [8, 0],
  [8, 2],
  [8, 4],
  [8, 6],
  [8, 8],
  [6, 8],
  [4, 8],
  [2, 8],
  [0, 8],
  [0, 6],
  [0, 4],
  [0, 2],
].map(([x, y]) => encodeSquareId(x, y))

type JoinGameBlockProps = {
  onJoin: () => void;
  onClose: MouseEventHandler;
}

export default function JoinGameBlock({onJoin, onClose}: JoinGameBlockProps) {
  const {selectedSquare, pendingPlayerPiece, pieces, activeGame, playerAdjacentSquares, setPlayerAdjacentSquares, board} = useGame()
  const firstPiece = pendingPlayerPiece!
  const firstPieceImage = getPieceImage(firstPiece)
  const coords = selectedSquare == null ? [-1, -1] : decodeSquareId(selectedSquare)
  const {write: enterGame, isLoading, isSuccess, isError} = useJoinGame(firstPiece, coords[0], coords[1])
  const [availableInitialSquares, setAvailableInitialSquares] = useState<SquareId[] | undefined>()

  useEffect(() => {
    if (playerAdjacentSquares == null || playerAdjacentSquares.length === 0) {
      const avis = initialSquares.filter(sqid => board[sqid] == null)
      setAvailableInitialSquares(avis)
      setPlayerAdjacentSquares(avis)
    }
  }, [
    activeGame,
    board,
    setAvailableInitialSquares,
    setPlayerAdjacentSquares,
    playerAdjacentSquares,
  ])

  const players = pieces
    ? Object.values(pieces).filter(p => p.pieceType === PLAYER).length
    : null

  useEffect(() => {
    if (isSuccess) {
      onJoin()
    }
  }, [isSuccess, onJoin])

  return (
    <Block title='your doomie' onClose={onClose}>
      <div className='flex justify-center items-center mt-auto bg-black rounded-lg py-2'>
        <img src={firstPieceImage}/>
      </div>
      <div className='flex w-full justify-center align-center mt-auto'>
        <Button
          text={activeGame
            ? players === 16
              ? 'wait for the next game'
              : selectedSquare == null
                ? 'select an initial square'
                : availableInitialSquares?.includes(selectedSquare)
                  ? 'join game'
                  : isLoading
                    ? 'joining game...'
                    : isError
                      ? 'error joining game'
                      : 'select an initial square'
            : 'waiting for a new game'}
          isDisabled={
            selectedSquare == null
            || isLoading
            || !activeGame
            || !availableInitialSquares?.includes(selectedSquare)
          }
          onClick={() => {
            enterGame?.()
          }}
        />
      </div>
    </Block>
  )
}
