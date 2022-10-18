import type {MouseEventHandler, ReactNode} from 'react'
import Close from '../assets/close.svg'

type BlockProps = {
  title: string;
  children: ReactNode;
  onClose?: MouseEventHandler;
}

export default function Block({children, title, onClose}: BlockProps) {
  return (
    <>
      {onClose && (
        <div
          className='absolute top-4 left-4 cursor-pointer md:top-6 md:left-6'
          onClick={onClose}
        >
          <img src={Close} className='w-4 h-4 md:h-full md:w-full'/>
        </div>
      )}
      <div className='uppercase font-bold text-2xl text-d-brown-1 tracking-widest truncate mt-0 flex-none md:text-3xl md:mt-6'>
        {title}
      </div>
      {children}
    </>
  )
}
