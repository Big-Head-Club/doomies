import type { SquareId, SquareState } from "./squares";
import { encodeSquareId } from "./squares";

export type Board = Record<SquareId, SquareState>;
export const createBoard = (
  side: number,
  init?: (x: number, y: number) => SquareState
): Board => {
  const board: Board = {};
  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      board[encodeSquareId(x, y)] = init == null ? undefined : init(x, y);
    }
  }

  return board;
};
