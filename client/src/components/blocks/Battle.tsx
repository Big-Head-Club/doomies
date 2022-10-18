import {useGame} from '../../contexts/GameContext'
import Block from '../Block'
import type {AvailableStats, StatsRecord} from '../../utils/stats'
import BattleRow from '../BattleRow'
import BattleRollSquare from '../BattleRollSquare'
import BattleResult from '../BattleResult'
import {useStorage} from '../../contexts/StorageContext'

type BattleBlockProps = {
  battleIndex: number;
  onClose: () => void;
  isFresh: boolean;
}

export default function BattleBlock({battleIndex, isFresh, onClose}: BattleBlockProps) {
  const {pieces, battleLogs} = useGame()
  const {updateStaleBattles, updateFreshBattles} = useStorage()
  const battle = battleLogs[battleIndex]
  const player1 = pieces ? pieces[battle.player1] : undefined
  const player2 = pieces ? pieces[battle.player2] : undefined
  const player1rolls = battle.rolls1.map(Number)
  const player2rolls = battle.rolls2.map(Number)

  const playerWonRoll = (stat1: number, roll1: number, stat2: number, roll2: number) =>
    stat1 === 0
      ? false
      : stat2 === 0
        ? true
        : roll1 > roll2

  const playerVictories = (stats1: StatsRecord, rolls1: number[], stats2: StatsRecord, roll2: number[]) =>
    Object.entries(stats1)
      .map(([s, v], idx) => playerWonRoll(v, rolls1[idx], stats2[s as AvailableStats], roll2[idx]))
      .map(b => b ? 1 : 0)
      .reduce((sum: number, cur: 1 | 0) => sum + cur, 0)

  const player1victories = player1 && player2
    ? playerVictories(player1.stats!, player1rolls, player2.stats!, player2rolls)
    : undefined

  const player2victories = player1 && player2
    ? playerVictories(player2.stats!, player2rolls, player1.stats!, player1rolls)
    : undefined

  const playerAutowin = (stat1: number, stat2: number): number =>
    stat1 === 0 && stat2 !== 0 
      ? 2 
      : stat2 === 0 && stat1 !== 0 
        ? 1 
        : 0

  const isTie = (stat1: number, stat2: number): boolean => 
    stat1 === 0 && stat2 === 0

  return (
    <Block
      title='battle'
      onClose={() => {
        if (isFresh) {
          // Take it out of the fresh battle stack
          updateFreshBattles(bs =>
            bs.filter(({blockNumber, logIndex}) =>
              blockNumber !== battle.blockNumber && logIndex !== battle.logIndex,
            ),
          )
          // Add it to the stale battle stack
          updateStaleBattles(bs => [
            ...bs,
            {blockNumber: battle.blockNumber, logIndex: battle.logIndex},
          ])
        }

        onClose()
      }}
    >
      {isFresh ? 'You were in a battle!' : ''}
      <div className='flex flex-col gap-y-2 w-full mt-4 pb-6 border-black border-b-2 md:mt-8 md:gap-y-4'>
        <BattleRow
          start={`#${battle.player1}`}
          end={`#${battle.player2}`}
        />
        {player1 && player2 && (
          Object.entries(player1.stats!).map(([stat, value], idx) => (
            <BattleRow
              key={stat}
              start={
                <BattleRollSquare
                  isVictory={playerWonRoll(
                    value,
                    player1rolls[idx],
                    player2.stats![stat as AvailableStats]!,
                    player2rolls[idx],
                  )}
                  isTie={isTie(value, player2.stats![stat as AvailableStats]!)}
                  isAutowin={playerAutowin(value, player2.stats![stat as AvailableStats]!) === 1}
                  roll={player1rolls[idx]}
                />
              }
              center={stat}
              end={
                <BattleRollSquare
                  isVictory={playerWonRoll(
                    player2.stats![stat as AvailableStats]!,
                    player2rolls[idx],
                    value,
                    player1rolls[idx],
                  )}
                  isTie={isTie(value, player2.stats![stat as AvailableStats]!)}
                  isAutowin={playerAutowin(value, player2.stats![stat as AvailableStats]!) === 2}
                  roll={player2rolls[idx]}
                />
              }
            />
          ))
        )}
      </div>
      <div className='flex flex-col gap-y-2 w-full md:gap-y-4'>
        <BattleRow
          start={
            player1
            && player1victories
            && <BattleResult isVictor={player1.id === battle.victor} victories={player1victories}/>
          }
          end={
            player2
            && player2victories
            && <BattleResult isVictor={player2.id === battle.victor} victories={player2victories}/>
          }
        />
      </div>
      <a
        className='text-sm text-d-yellow underline mt-4 md:mt-8'
        href='https://doomies.xyz/#game'
      >
        Confused? Check out the rule details here.
      </a>
    </Block>
  )
}
