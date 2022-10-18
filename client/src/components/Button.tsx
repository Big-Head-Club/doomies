import type {MouseEventHandler} from 'react'

type ButtonProps = {
  text: string;
  isDisabled?: boolean;
  onClick?: MouseEventHandler;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}
export default function Button({text, isDisabled, onClick}: ButtonProps) {
  return (
    <div
      className={`
        cursor-pointer
        flex
        justify-center
        items-center
        border-4
        ${isDisabled ? 'border-d-gray-2' : 'border-d-yellow'}
        font-bold
        text-d-gray-1
        ${isDisabled ? 'bg-d-gray-2' : 'bg-d-yellow'}
        rounded-[70px]
        px-5
        w-full
        h-12
      `}
      onClick={isDisabled ? noop : onClick}
    >
      <div className='text-center text-lg truncate uppercase'>{text}</div>
    </div>
  )
}
