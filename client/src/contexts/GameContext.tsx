import type {ReactNode} from 'react'
import {useCallback} from 'react'
import {createContext, useContext, useMemo, useReducer} from 'react'
import {
  SETGAME,
  UPDATEBOARD,
  UPDATEPIECES,
  DESELECTSQUARE,
  SELECTSQUARE,
  SELECTDOOMIE,
  SETPLAYERPIECE,
  SETPLAYERTOKENS,
  SETPLAYERADJACENTSQUARES,
  UPDATEMOVES,
  UPDATEBATTLELOGS,
} from '../utils/constants/game-event'
import type {SquareCoords, SquareId} from '../utils/squares'
import {findPieceSquare, getPendingMove, selectAdjacent} from '../utils/squares'
import type {Piece, PieceId, Pieces} from '../utils/pieces'
import type {Board} from '../utils/board'
import {createBoard} from '../utils/board'
import {err} from '../utils/debug'
import type {BattleLogEvent, MoveEvent} from '../utils/events'
import type {BigNumber} from 'ethers'
import {UINT32_MAX} from '../utils/constants/solidity'

export type GameState = [
  number[][], // _board
  number, // Game
  number, // Turn
  boolean, // GameIsActive
  BigNumber, // TimeTillTurnEnds
  number, // StartTime
  number, // LastBattle
  number, // Players
  number, // Remaining
];

type Event =
  | {type: typeof SETGAME; payload: GameState}
  | {type: typeof UPDATEBATTLELOGS; payload: (battleLogs: BattleLogEvent[]) => BattleLogEvent[]}
  | {type: typeof UPDATEMOVES; payload: (moves: MoveEvent[]) => MoveEvent[]}
  | {type: typeof SETPLAYERTOKENS; payload: [number[], number[]]}
  | {type: typeof SETPLAYERPIECE}
  | {type: typeof SETPLAYERADJACENTSQUARES; payload?: SquareId[]}
  | {type: typeof UPDATEBOARD; payload: (board: Board) => Board}
  | {type: typeof UPDATEPIECES; payload: (pieces?: Pieces) => Pieces}
  | {type: typeof SELECTSQUARE; payload: SquareId}
  | {type: typeof SELECTDOOMIE; payload: number}
  | {type: typeof DESELECTSQUARE}

type Dispatch = (event: Event) => void;

export type State = {
  board: Board;
  gameId?: number;
  turn?: number;
  activeGame?: boolean;
  timeLeft?: number;
  pieces?: Pieces;
  selectedSquare?: SquareId;
  selectedPiece?: Piece;
  playerTokens?: {available: number[]; spent: number[]};
  playerPiece?: PieceId;
  playerAdjacentSquares?: SquareId[];
  pendingPlayerPiece?: PieceId;
  pendingMove?: SquareCoords;
  playersRemaining?: number;
  moves: MoveEvent[];
  battleLogs: BattleLogEvent[];
}

const GameContext = createContext<{state: State; dispatch: Dispatch} | undefined>(undefined)

function gameReducer(state: State, event: Event): State {
  switch (event.type) {
  case SETGAME:
    // Get all ids on board and substitute them with the corresponding pieces
    return {
      ...state,
      board: createBoard(
        event?.payload[0]?.length,
        (x: number, y: number) => {
          const pieceId = event?.payload[0][x][y]
          return pieceId === 0 ? undefined : pieceId
        }),
      gameId: event.payload[1],
      turn: event.payload[2],
      activeGame: event.payload[3],
      timeLeft: event.payload[4].toNumber(),
      playersRemaining: event.payload[8],
    }
  case SETPLAYERTOKENS:
    return {
      ...state,
      playerTokens: {available: event.payload[0], spent: event.payload[1]},
    }
  case SETPLAYERPIECE:
    return {
      ...state,
      playerPiece: Object.values(state.board)
        .find(sq => sq != null && state.playerTokens?.spent?.includes(sq)),
    }
  case SETPLAYERADJACENTSQUARES:
    return {
      ...state,
      playerAdjacentSquares: event.payload ?? selectAdjacent(findPieceSquare(state.playerPiece, state.board)),
    }
  case UPDATEMOVES:
    // If a new move comes in that says a player picked up a weapon,
    // update that piece to reflect that.
    // This way we can display battle logs correctly, because only
    // move events store the player-weapon relationship for dead pieces.
    // Also ignore move events that are join events (data === UINT32_MAX - 1)
    return {
      ...state,
      moves: event.payload(state.moves),
      pieces: state.pieces == null
        ? state.pieces
        : event.payload(state.moves).reduce((acc, cur) =>
          cur.data === 0 || cur.data === UINT32_MAX || cur.data === UINT32_MAX - 1
            ? acc
            : {...acc, [cur.pieceId]: {...acc[cur.pieceId], weapon: cur.data}}
        , state.pieces),
    }
  case UPDATEBATTLELOGS:
    return {
      ...state,
      battleLogs: event.payload(state.battleLogs),
    }
  case UPDATEPIECES:
    // If the piece is a player holding a weapon, and we're updating
    // that field to UINT32_MAX, it means the player is now dead.
    // To avoid losing the player-weapon relationship, we ignore that number
    // and keep the old weapon ID.
    return {
      ...state,
      pieces: state.pieces == null
        ? event.payload(state.pieces)
        : Object.entries(event.payload(state.pieces)).reduce((acc, [pid, p]) =>
          p.weapon === UINT32_MAX
            ? {
              ...acc, [pid]: {
                ...(state.pieces![pid as unknown as number] ?? {}),
                ...p,
                weapon: (state.pieces![pid as unknown as number]
                  ? state.pieces![pid as unknown as number].weapon
                  : p.weapon
                ),
              },
            }
            : {...acc, [pid]: {...p}}
        , state.pieces),

    }
  case UPDATEBOARD:
    return {
      ...state,
      board: event.payload(state.board),
    }
  case SELECTSQUARE:
    if (!(event.payload in state.board)) {
      err(`Square with ID ${event.payload} doesn't exist!`)
      return state
    }

    return {
      ...state,
      selectedSquare: event.payload,
      pendingMove: getPendingMove(state.playerAdjacentSquares, event.payload, findPieceSquare(state.playerPiece, state.board)),
      selectedPiece: state.pieces
        ? state.pieces[state.board[event.payload]!]?.name
          ? state.pieces[state.board[event.payload]!] as Piece
          : undefined
        : undefined,
    }
  case DESELECTSQUARE:
    return {
      ...state,
      selectedPiece: undefined,
      selectedSquare: undefined,
    }
  case SELECTDOOMIE:
    return {
      ...state,
      pendingPlayerPiece: event.payload,
    }
  default:
    return state
  }
}

type GameProviderProps = {children: ReactNode; side: number}

function GameProvider({children, side}: GameProviderProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    {board: createBoard(side), moves: [], battleLogs: []},
  )

  const value = useMemo(() => ({state, dispatch}), [state, dispatch])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }

  const {state, dispatch} = context

  const updateBoard = useCallback((payload: (board: Board) => Board) => {
    dispatch({type: UPDATEBOARD, payload})
  }, [dispatch])

  const updatePieces = useCallback((payload: (pieces?: Pieces) => Pieces) => {
    dispatch({type: UPDATEPIECES, payload})
  }, [dispatch])

  const setPlayerPiece = useCallback(() => {
    dispatch({type: SETPLAYERPIECE})
  }, [dispatch])

  const setPlayerAdjacentSquares = useCallback((payload?: SquareId[]) => {
    dispatch({type: SETPLAYERADJACENTSQUARES, payload})
  }, [dispatch])

  const setGame = useCallback((payload: GameState) => {
    dispatch({type: SETGAME, payload})
  }, [dispatch])

  const setPlayerTokens = useCallback((payload: [number[], number[]]) => {
    dispatch({type: SETPLAYERTOKENS, payload})
  }, [dispatch])

  const getSquareState = useCallback((payload: SquareId) => {
    const pieceId = state.board[payload]
    return pieceId
    // Return pieceId == null ? undefined : state.pieces[pieceId]
  }, [state])

  const getPiece = useCallback((payload: PieceId) =>
    state.pieces ? state.pieces[payload] : undefined
  , [state])

  const selectSquare = useCallback((payload: SquareId) => {
    dispatch({type: SELECTSQUARE, payload})
  }, [dispatch])

  const selectDoomie = useCallback((payload: PieceId) => {
    dispatch({type: SELECTDOOMIE, payload})
  }, [dispatch])

  const deselectSquare = useCallback(() => {
    dispatch({type: DESELECTSQUARE})
  }, [dispatch])

  const updateMoves = useCallback((payload: (moves: MoveEvent[]) => MoveEvent[]) => {
    dispatch({type: UPDATEMOVES, payload})
  }, [dispatch])

  const updateBattleLogs = useCallback((payload: (battleLogs: BattleLogEvent[]) => BattleLogEvent[]) => {
    dispatch({type: UPDATEBATTLELOGS, payload})
  }, [dispatch])

  return {
    ...state,
    setGame,
    setPlayerTokens,
    setPlayerPiece,
    setPlayerAdjacentSquares,
    updateBoard,
    updatePieces,
    getSquareState,
    getPiece,
    selectSquare,
    deselectSquare,
    updateMoves,
    updateBattleLogs,
    selectDoomie,
  }
}

export {GameProvider, useGame}
