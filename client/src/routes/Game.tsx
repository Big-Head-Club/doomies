import {useEffect, useState} from 'react'
import {useGetCurrentGameState} from '../hooks/use-get-current-game-state'
import {useGetMyTokens} from '../hooks/use-get-my-tokens'
import {useGetPieces} from '../hooks/use-get-pieces'
import {useGame} from '../contexts/GameContext'
import TopBar from '../components/TopBar'
import Grid from '../components/Grid'
import type {SquareId} from '../utils/squares'
import {findPieceSquare} from '../utils/squares'
import Blocks from '../components/Blocks'

type GameProps = {side: number};

export default function Game({side}: GameProps) {
  const {
    board,
    playerTokens,
    playerPiece,
    setPlayerPiece,
    setPlayerAdjacentSquares,
  } = useGame()
  const [lastSquare, setLastSquare] = useState<SquareId | undefined>()

  useGetCurrentGameState()
  useGetPieces()
  useGetMyTokens()

  // Check if playerTokens and board changed, setPlayerPiece accordingly
  useEffect(() => {
    if (playerPiece == null) {
      setPlayerPiece()
    }
  }, [board, playerTokens, playerPiece, setPlayerPiece])

  // Check if player moved, highlight adjacent squares (or initial squares)
  useEffect(() => {
    if (playerPiece != null) {
      const currentSquare = findPieceSquare(playerPiece, board)
      if (lastSquare !== currentSquare) {
        setPlayerAdjacentSquares()
        setLastSquare(currentSquare)
      }
    }
  }, [board, playerPiece, setPlayerAdjacentSquares, lastSquare])

  return (
    <>
      <TopBar
        onQuestion={() => {
          window.location.assign('https://doomies.xyz/')
        }}
      />
      <div
        className='
          game
          px-6 
          py-4 
          max-h-screen
          overflow-y-auto
          md:flex 
          md:justify-between 
          md:px-14 
          md:py-10 
          md:gap-y-12
          md:overflow-hidden 
        '
      >
        <Grid side={side}/>
        <Blocks/>
      </div>
    </>
  )
}
