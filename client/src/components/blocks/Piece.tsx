import {useState, useEffect} from 'react'
import {useGame} from '../../contexts/GameContext'
import type {Piece} from '../../utils/pieces'
import {getPieceWeaponStats} from '../../utils/pieces'
import Block from '../Block'
import {getPieceImage} from '../../utils/pieces'
import type {AvailableStats} from '../../utils/stats'

type PieceBlockProps = {
  piece: Piece;
}

export default function PieceBlock({piece}: PieceBlockProps) {
  const [weaponImg, setWeaponImg] = useState('')
  const [bgStyle, setBgStyle] = useState({})
  const {pieces, deselectSquare} = useGame()

  const pieceWeaponStats = getPieceWeaponStats(pieces, piece)

  useEffect(() => {
    if (piece.weapon) {
      const weaponImg = getPieceImage(piece.weapon, false)
      setWeaponImg(weaponImg)
      const styles = {
        backgroundImage: `url(${piece.image})`,
        backgroundSize: 'cover',
      }
      setBgStyle(styles)
    }
  }, [piece, piece?.weapon])

  return (
    <Block
      title={piece.name}
      onClose={() => {
        deselectSquare()
      }}
    >
      <div className='flex justify-center items-center mt-auto'>
        {piece.weapon
          ? (
            <div style={bgStyle} className='text-neutral-100 w-64 h-64'>
              <img src={weaponImg} className='rounded'/>
            </div>
          )
          : (
            <div className='text-neutral-100 w-64 h-64'>
              <img src={piece.image} className='rounded'/>
            </div>
          )}
      </div>
      <div className='flex flex-col gap-y-4 w-2/3 mt-auto mb-4'>
        {Object.entries(piece.stats).map(([stat, value]) => (
          <div key={stat} className='flex justify-between'>
            <div className='font-semibold tracking-widest uppercase'>{stat}</div>
            <div className='flex gap-x-2 tracking-widest'>
              <div>{value}</div>
              {pieceWeaponStats != null && pieceWeaponStats[stat as AvailableStats] && pieceWeaponStats[stat as AvailableStats] !== 0 && (
                <div className={pieceWeaponStats[stat as AvailableStats] > 0 ? 'text-d-yellow' : 'text-d-red'}>
                  {/* stat includes `-` if it is a negative modifer. We add a `+` if it is a positive modifier */}
                  ({pieceWeaponStats[stat as AvailableStats] > 0 ? '+' : ''}{pieceWeaponStats[stat as AvailableStats]})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Block>
  )
}
