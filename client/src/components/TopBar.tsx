import {Disclosure} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import type {MouseEventHandler} from 'react'
import {useTimeLeft} from '../hooks/use-time-left'
import {useTotalPrize} from '../hooks/use-total-prize'
import Connect from './Connect'
import Pill from './Pill'
import Title from './Title'

type TopBarProps = {
  onQuestion: MouseEventHandler;
}

export default function TopBar({onQuestion}: TopBarProps) {
  const countdownStr = useTimeLeft()
  const totalPrizeStr = useTotalPrize()

  return (
    <Disclosure className='bg-d-gray-1' as='nav'>
      {({open}) => (
        <>
          <div className='h-12 md:h-24 w-full flex items-center px-4 md:px-16'>
            <Title/>
            <div className='flex-1'/>
            <div className='relative flex h-16 items-center justify-between'>
              <div className='absolute inset-y-0 right-0 flex items-center md:hidden'>
                {/* Mobile menu button */}
                <Disclosure.Button className='
                  inline-flex 
                  items-center 
                  justify-center 
                  rounded-md 
                  p-2 
                  text-gray-400 
                  hover:bg-gray-700 
                  hover:text-white 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-inset 
                  focus:ring-d-brown-1
                '>
                  <span className='sr-only'>Open main menu</span>
                  {open 
                    ? <XMarkIcon className='block h-6 w-6' aria-hidden='true'/>
                    : <Bars3Icon className='block h-6 w-6' aria-hidden='true'/>}
                </Disclosure.Button>
              </div>
              <div 
                className='flex flex-1 items-center justify-center md:items-stretch md:justify-start'
              >
                <div className='hidden md:ml-6 md:block'>
                  <div className='flex space-x-4'>
                    <Pill text='total prize' data={totalPrizeStr}/>
                    <Pill text='time left' data={countdownStr}/>
                    <div className='w-40'>
                      <Connect/>
                    </div>
                    <div
                      className='text-d-brown-1 text-2xl font-bold border-4 border-d-blue rounded-full aspect-square w-12 flex justify-center items-center cursor-pointer'
                      onClick={onQuestion}
                    >
                      ?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='md:hidden'>
            <div className='flex flex-col items-center gap-y-3 px-2 pt-2 pb-4'>
              <Pill text='total prize' data={totalPrizeStr}/>
              <Pill text='time left' data={countdownStr}/>
              <div className='flex gap-x-2 w-4/5'>
                <div className='w-4/5'>
                  <Connect/>
                </div>
                <div
                  className='text-d-brown-1 text-2xl font-bold border-4 border-d-blue rounded-full aspect-square w-12 flex justify-center items-center cursor-pointer'
                  onClick={onQuestion}
                >
                  ?
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
