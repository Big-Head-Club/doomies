import type {ReactNode} from 'react'

type BattleRowProps = {
  start: ReactNode | string;
  center?: ReactNode | string;
  end: ReactNode | string;
}

export default function BattleRow({start, center, end}: BattleRowProps) {
  return (
    <div className='flex'>
      <div className='w-1/3 flex justify-center items-center tracking-widest'>
        {start}
      </div>
      <div className='w-1/3 flex justify-center items-center tracking-widest font-semibold uppercase text-sm md:text-md'>
        {center}
      </div>
      <div className='w-1/3 flex justify-center items-center tracking-widest'>
        {end}
      </div>
    </div>
  )
}
