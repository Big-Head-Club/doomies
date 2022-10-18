import {useGame} from '../../contexts/GameContext'
import {useGetBattles} from '../../hooks/use-get-battles'
import {useGetMoves} from '../../hooks/use-get-moves'
import type {BattleLogEvent, MoveEvent} from '../../utils/events'
import {findBattleIndex} from '../../utils/events'
import {sortEvents} from '../../utils/events'
import BattleIcon from '../../assets/battle.svg'
import MovementIcon from '../../assets/movement.svg'
import Block from '../Block'
import {squareIdToChess} from '../../utils/squares'

type ActivityBlockProps = {
  setBattle: (idx: number) => void;
}

export default function ActivityBlock({setBattle}: ActivityBlockProps) {
  useGetBattles()
  useGetMoves()
  const {battleLogs, moves} = useGame()

  const activity = [...battleLogs, ...moves]

  const isBattleEvent = (event: BattleLogEvent | MoveEvent): event is BattleLogEvent =>
    'victor' in event

  const moveEventIntoChess = ({x, y}: MoveEvent) =>
    squareIdToChess(`${x}-${y}`)

  return (
    <Block title='activity'>
      <div className='w-full overflow-y-scroll flex-1 mt-4 mb-2 md:mb-4 md:mt-8'>
        {activity.length === 0
          ? <div className='text-xl w-full text-center'>There is no activity yet.</div>
          : sortEvents(activity).reverse().map((event: MoveEvent | BattleLogEvent) => (
            <div
              key={`${event.blockNumber}-${event.logIndex}`}
              className='border-bottom p-2 border-b-2 border-black w-full md:py-4'
            >
              <div
                className={`flex gap-x-4 ${isBattleEvent(event) ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (isBattleEvent(event)) {
                    setBattle(findBattleIndex(event, battleLogs))
                  }
                }}
              >
                <div className='flex justify-center items-center'>
                  <img src={isBattleEvent(event) ? BattleIcon : MovementIcon}/>
                </div>
                <div className='flex flex-col'>
                  {
                    isBattleEvent(event)
                      ? (
                        <p className='text-base tracking-normal'>
                          <b>#{event.victor}</b> defeated <b>#{event.victor === event.player1 ? event.player2 : event.player1}</b> in battle.
                        </p>
                      )
                      : (
                        <p className='text-base tracking-normal'>
                          <b>#{event.pieceId}</b> moved to tile <b>{moveEventIntoChess(event)}</b>.
                        </p>
                      )
                  }
                  <div className='text-xs'>
                    Turn {event.turn}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </Block>
  )
}
