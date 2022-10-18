import Trophy from '../assets/trophy.svg'
import Skull from '../assets/skull.svg'

type BattleResultProps = {
  victories: number;
  isVictor: boolean;
}

export default function BattleResult({victories, isVictor}: BattleResultProps) {
  return (
    <div className='flex flex-col gap-y-2 mt-4'>
      <div className={`text-center ${isVictor ? 'font-bold text-d-yellow' : ''}`}>{victories}/7</div>
      <div>
        <img src={isVictor ? Trophy : Skull}/>
      </div>
    </div>
  )
}
