import type {Board} from './board'
import type {PieceId} from './pieces'

export type SquareState = PieceId | undefined;
export type SquareId = string;
export type SquareCoords = [number, number];

export const encodeSquareId = (x: number, y: number): SquareId => `${x}-${y}`

export const decodeSquareId = (squareId: SquareId): SquareCoords =>
  squareId.split('-').map(v => parseInt(v, 10)) as SquareCoords // We know there can only be x and y (for now)

export const getPendingMove = (
  adjacentToSelectedSquare: SquareId[] | undefined,
  proposedSquare: SquareId,
  playerSquare: SquareId | undefined,
): SquareCoords | undefined => {
  if (adjacentToSelectedSquare == null || playerSquare == null) {
    return
  }

  const targetSquare = adjacentToSelectedSquare.find(sq => sq === proposedSquare)
  if (targetSquare == null) {
    return
  }

  const [px, py] = decodeSquareId(playerSquare)
  const [tx, ty] = decodeSquareId(targetSquare)
  return [tx - px, ty - py]
}

export const findPieceSquare = (pieceId: PieceId | undefined, board: Board): SquareId | undefined => {
  if (pieceId == null) {
    return
  }

  const entry = Object.entries(board).find(([_, pid]) => pid === pieceId)
  return entry == null ? undefined : entry[0]
}

export const selectAdjacent = (squareId: SquareId | undefined): SquareId[] => {
  if (squareId == null) {
    return []
  }

  const mainSquare = decodeSquareId(squareId)

  // 8 possible squares
  // Considering X axis we only move 1, 0 or -1
  // Same for Y axis
  // Combine both to generate all possible squares
  const possibleDirections = [1, 0, -1]

  const possibleOnAxis = (tuple: SquareCoords, axis: number) =>
    possibleDirections.map((d: number) => d + tuple[axis])

  const possibilityMatrix = (xs: number[], ys: number[]): SquareCoords[] =>
    xs.flatMap((x: number) => ys.map((y: number): SquareCoords => [x, y]))

  return possibilityMatrix(
    possibleOnAxis(mainSquare, 0),
    possibleOnAxis(mainSquare, 1),
  )
    .map(([x, y]: SquareCoords) => encodeSquareId(x, y))
    .filter((id: SquareId) => id !== squareId)
}

const numToAlpha = 'ABCDEFGHI'

export const squareIdToChess = (squareId: SquareId): string => {
  const decoded = decodeSquareId(squareId)
  return [numToAlpha[decoded[0]], decoded[1] + 1].join('')
}
