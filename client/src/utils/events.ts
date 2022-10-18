import type {BattleIndex} from '../contexts/StorageContext'
import type {Board} from './board'
import type {PieceId} from './pieces'
import {encodeSquareId} from './squares'

export type NewGameEvent = number

export type MoveSubmission = {
  pieceId: PieceId;
  dx: 1 | 0 | -1;
  dy: 1 | 0 | -1;
}

export type RawMoveEvent = [number, number, number, number, number, number]

export type MoveEvent = {
  blockNumber: number;
  logIndex: number;
  pieceId: PieceId;
  x: number;
  y: number;
  game: number;
  turn: number;
  data: number;
}

export type RawBattleLogEvent = [number, number, number[], number[], number, number, number]

export type BattleLogEvent = {
  blockNumber: number;
  logIndex: number;
  player1: PieceId;
  player2: PieceId;
  rolls1: number[];
  rolls2: number[];
  victor: number;
  turn: number;
  game: number;
}

export const parseMoveEvent = (blockNumber: number, logIndex: number, rmve: RawMoveEvent): MoveEvent =>
  ({
    blockNumber,
    logIndex,
    pieceId: rmve[0],
    x: rmve[1],
    y: rmve[2],
    game: rmve[3],
    turn: rmve[4],
    data: rmve[5],
  })

export const findBattleIndex = <E extends BattleIndex>(event: E, logs: BattleLogEvent[]) =>
  logs.findIndex(({blockNumber, logIndex}) =>
    blockNumber === event.blockNumber && logIndex === event.logIndex,
  )

export const parseBattleLogEvent = (blockNumber: number, logIndex: number, rble: RawBattleLogEvent): BattleLogEvent =>
  ({
    blockNumber,
    logIndex,
    player1: rble[0],
    player2: rble[1],
    rolls1: rble[2],
    rolls2: rble[3],
    victor: rble[4],
    turn: rble[5],
    game: rble[6],
  })

export const sortEvents = (events: Array<BattleLogEvent | MoveEvent>): Array<BattleLogEvent | MoveEvent> =>
  events
    .slice() // Don't mutate args
    .sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex)

export const processMoveEvent = (move: MoveEvent) => (board: Board): Board =>
  Object.fromEntries(
    Object.entries(board).map(
      ([sqid, pid]) => sqid === encodeSquareId(move.x, move.y)
        ? [sqid, move.pieceId]
        : pid === move.pieceId
          ? [sqid, undefined]
          : [sqid, pid],
    ),
  )
