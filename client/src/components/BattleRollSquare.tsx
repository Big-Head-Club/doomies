type BattleRollSquareProps = {
  roll: number;
  isVictory: boolean;
  isAutowin: boolean;
  isTie: boolean;
}

export default function BattleRollSquare({roll, isVictory, isTie, isAutowin}: BattleRollSquareProps) {
  return (
    <div className={`
      h-10 
      w-10 
      flex
      justify-center
      items-center
      text-2xl
      pb-1
      ${(isVictory || isAutowin) && !isTie ? 'text-d-yellow font-bold' : 'text-d-brown-1'}
      ${(isVictory || isAutowin) && !isTie ? 'border-[3px] border-d-yellow' : 'border border-d-brown-1'}
    `}
    >
      {roll}
    </div>
  )
}
