// Timer, turn, prize info (single)

type PillProps = {
  text: string;
  data: string;
};

export default function Pill({text, data}: PillProps) {
  return (
    <div className='flex justify-between items-center gap-x-6 border-4 border-d-blue rounded-[70px] px-5 w-72 h-12'>
      <div className='text-center text-lg uppercase'>{text}</div>
      <div className='text-center text-lg font-bold uppercase'>{data}</div>
    </div>
  )
}
