import {useGame} from '../contexts/GameContext'
import {getPieceImage} from '../utils/pieces'

type PieceProps = {
  piece: number;
};

export default function Piece({piece}: PieceProps) {
  // @TODO: put this somewhere else so we don't call it for each piece
  //   on the board.
  const {pieces} = useGame()
  if (!pieces || !piece) {
    return <div/>
  }

  const p = pieces[piece]
  if (!p || !p.image) {
    return <div/>
  }

  if (p.weapon) {
    const weaponImg = getPieceImage(p.weapon, false)
    const bgStyle = {
      backgroundImage: `url(${p.image})`,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
    }
    return (
      <div style={bgStyle} className='text-neutral-100'>
        <img src={weaponImg} className='rounded-full'/>
      </div>
    )
  }

  return (
    <div className='text-neutral-100'>
      <img src={p.image} className='rounded-full'/>
    </div>
  )
}
