import Block from '../Block'
import Button from '../Button'
import FakeDoomie from '../../assets/nft.png'
import {useGame} from '../../contexts/GameContext'
import {useState} from 'react'
import {getPieceImage} from '../../utils/pieces'
import ReactImageFallback from 'react-image-fallback'

type DoomieSelectionBlockProps = {
  onClose: () => void;
}

export default function DoomieSelectionBlock({onClose}: DoomieSelectionBlockProps) {
  const [selected, setSelected] = useState<number | undefined>()
  const {selectDoomie, playerTokens} = useGame()
  const playerTokenImages: Record<number, string> | undefined = playerTokens?.available
    .reduce((acc, cur) => ({...acc, [cur]: getPieceImage(cur)}), {})

  return (
    <Block title='pick your doomie' onClose={onClose}>
      <div className='flex flex-wrap justify-center mt-auto'>
        {playerTokens?.available.map(t => (
          <div
            key={t}
            className='w-1/2 cursor-pointer p-2'
          >
            <div className={`
              flex 
              flex-col
              px-2
              py-3
              justify-center
              border-2
              bg-black
              ${selected === t ? 'border-d-yellow' : 'border-d-gray-2 hover:border-d-brown-1'}
              rounded-lg
              relative
          `}>
              <div className='absolute top-2 left-3 text-sm font-semibold'>#{t}</div>
              {playerTokenImages?.[t] && (
                <ReactImageFallback
                  src={playerTokenImages[t]}
                  fallbackImage={FakeDoomie}
                  onClick={() => {
                    setSelected(t)
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className='mt-auto w-full'>
        <Button
          text='pick doomie'
          isDisabled={selected == null}
          onClick={() => {
            if (selected) {
              selectDoomie(selected)
            }
          }}
        />
      </div>
    </Block>
  )
}
