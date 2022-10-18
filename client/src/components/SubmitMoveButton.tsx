import {useSubmitMove} from '../hooks/use-submit-move'
import type {PieceId} from '../utils/pieces'
import type {SquareCoords} from '../utils/squares'
import Button from './Button'

type SubmitMoveButtonProps = {
  pieceId: PieceId;
  pendingMove: SquareCoords;
};

export default function SubmitMoveButton({pieceId, pendingMove}: SubmitMoveButtonProps) {
  const {write: submitMove, hasMoved, isLoading, isError} = useSubmitMove(pieceId, pendingMove)

  return (
    <div className='flex-none w-full'>
      <Button
        text={isLoading
          ? 'submitting move'
          : isError
            ? 'error submitting move'
            : hasMoved
              ? 'waiting for next turn'
              : 'submit move'}
        isDisabled={isLoading || hasMoved}
        onClick={() => {
          submitMove?.()
        }}
      />
    </div>
  )
}
