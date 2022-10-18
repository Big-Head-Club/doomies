import {encodeSquareId} from '../utils/squares'
import Square from './Square'

type GridProps = {
  side: number;
};
export default function Grid({side}: GridProps) {
  const s = Array(side)
    .fill(null)
    .map((_, i) => i)
    .reverse()

  return (
    <div className='md:w-2/3 w-full overflow-hidden md:px-14'>
      <div className='grid grid-cols-9 aspect-square m-auto max-w-full max-h-full border-b-2 border-r-2 border-d-gray-1 bg-black rounded-2xl'>
        {s.map(y => (
          [...s].reverse().map(x => (
            <Square
              key={encodeSquareId(x, y)}
              id={encodeSquareId(x, y)}
            />
          ))
        ))}
      </div>
    </div>
  )
}
