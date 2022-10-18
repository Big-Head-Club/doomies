import {useEffect, useState} from 'react'
import {useGame} from '../contexts/GameContext'
import {encodeSquareId, squareIdToChess} from '../utils/squares'
import Piece from './Piece'

type SquareProps = {
  id: string;
};

export default function Square({id}: SquareProps) {
  const {
    board,
    selectedSquare,
    playerAdjacentSquares,
    getSquareState,
    selectSquare,
    pendingMove,
  } = useGame()
  const [squareState, setSquareState] = useState<number | undefined>()

  useEffect(() => {
    setSquareState(getSquareState(id))
  }, [board, getSquareState, id])

  const roundness = '1rem'

  const style = id === encodeSquareId(0, 0)
    ? {borderBottomLeftRadius: roundness}
    : id === encodeSquareId(8, 0)
      ? {borderBottomRightRadius: roundness}
      : id === encodeSquareId(0, 8)
        ? {borderTopLeftRadius: roundness}
        : id === encodeSquareId(8, 8)
          ? {borderTopRightRadius: roundness}
          : {}

  const isAdjacentToPlayer = playerAdjacentSquares?.includes(id)

  // Const isPlayerSquare = findPieceSquare(playerPiece, board) === id
  const isPendingMoveSquare = pendingMove && selectedSquare === id

  const highlight = isAdjacentToPlayer
    ? 'bg-d-green'
    : ''

  const handleClick = () => {
    selectSquare(id)
  }

  return (
    <div
      style={style}
      className='
        cursor-pointer
        transition-all
        duration-100
        border-t-2
        border-l-2
        border-d-gray-1
        flex
        justify-center
        items-center
        aspect-square
        relative
        bg-black
      '
      onClick={handleClick}
    >
      {squareState != null && <Piece piece={squareState}/>}
      <div className='hidden md:absolute md:top-1 md:left-1 md:text-xs md:opacity-25'>{squareIdToChess(id)}</div>
      <div
        style={style}
        className={`
          absolute 
          inset-0 
          ${highlight} 
          ${isPendingMoveSquare ? 'opacity-40' : highlight ? 'opacity-20' : 'opacity-0'} 
          hover:bg-d-green
          hover:opacity-40
        `}
      />
    </div>
  )
}
