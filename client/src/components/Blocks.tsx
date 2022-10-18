import {useEffect, useState} from 'react'
import {useGame} from '../contexts/GameContext'
import {blockTypes, useActiveBlocks} from '../hooks/use-active-blocks'

import PieceBlock from './blocks/Piece'
import SubmitMoveButton from './SubmitMoveButton'
import BuyDoomieBlock from './blocks/BuyDoomie'
import JoinGameBlock from './blocks/JoinGame'
import ActivityBlock from './blocks/Activity'
import GameOverBlock from './blocks/GameOver'
import DoomieSelectionBlock from './blocks/DoomieSelection'
import BattleBlock from './blocks/Battle'
import {useStorage} from '../contexts/StorageContext'
import {findBattleIndex} from '../utils/events'

export default function Blocks() {
  const {
    board,
    turn,
    activeGame,
    playerPiece,
    pendingMove,
    selectedPiece,
    playersRemaining,
    battleLogs,
  } = useGame()
  const {freshBattles} = useStorage()
  const [gameOver, setGameOver] = useState(false)
  const [battle, setBattle] = useState<{index: number; isFresh: boolean} | undefined>()
  const [joinedGame, setJoinedGame] = useState(false)
  const [refusedToJoin, setRefusedToJoin] = useState(false)
  const [refusedToMint, setRefusedToMint] = useState(false)
  const activeBlocks = useActiveBlocks({refusedToMint, refusedToJoin, joinedGame, gameOver, activeGame, battle: battle?.index})

  useEffect(() => {
    if (freshBattles.length > 0) {
      setBattle({
        index: findBattleIndex(freshBattles[freshBattles.length - 1], battleLogs),
        isFresh: true,
      })
    }
  }, [freshBattles, battleLogs])

  // Check if some player won whenever board/playersRemaining change
  useEffect(() => {
    if (playersRemaining === 1 && turn && turn !== 0) {
      setGameOver(true)
    }
  }, [board, playersRemaining, playerPiece, turn, setGameOver])

  const showSubmitMoveButton = playerPiece && pendingMove

  return (
    <div className='
      w-full
      my-4
      flex-none
      h-5/6
      md:h-full
      md:max-w-[420px]
      md:min-w-[300px]
      md:w-1/3
      md:flex
      md:flex-col
      md:items-end
      md:gap-y-4
      md:my-0 
    '
    >
      <div
        className='w-full flex-1 bg-d-gray-1 rounded-2xl flex flex-col items-center p-8 relative max-h-screen'
        style={{height: showSubmitMoveButton ? 'calc(100% - 80px)' : '100%'}}
      >
        {activeBlocks.has(blockTypes.piece) && <PieceBlock piece={selectedPiece!}/>}
        {activeBlocks.has(blockTypes.buyDoomie)
          && (
            <BuyDoomieBlock
              onClose={() => {
                setRefusedToMint(true)
              }}
            />
          )}
        {activeBlocks.has(blockTypes.joinGame)
          && (
            <JoinGameBlock
              onJoin={() => {
                setJoinedGame(true)
              }}
              onClose={() => {
                setRefusedToJoin(true)
              }}
            />
          )}
        {activeBlocks.has(blockTypes.selectDoomie) && (
          <DoomieSelectionBlock
            onClose={() => {
              setRefusedToJoin(true)
            }}
          />
        )}
        {activeBlocks.has(blockTypes.gameOver) && (
          <GameOverBlock
            onClose={() => {
              setGameOver(false)
            }}
          />
        )}
        {activeBlocks.has(blockTypes.battle) && (
          <BattleBlock
            battleIndex={battle!.index}
            isFresh={battle!.isFresh}
            onClose={() => {
              setBattle(undefined)
            }}
          />)}
        {activeBlocks.has(blockTypes.activity) && (
          <ActivityBlock
            setBattle={index => {
              setBattle({index, isFresh: false})
            }}
          />
        )}

      </div>
      {showSubmitMoveButton
        && (
          <div className='flex-none w-full'>
            <SubmitMoveButton pieceId={playerPiece} pendingMove={pendingMove}/>
          </div>
        )}
    </div>
  )
}
