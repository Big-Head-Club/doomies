import {useContractEvent, useContractRead} from 'wagmi'
import BattleViewer from '../abi/BattleViewer.json'
import {useGame} from '../contexts/GameContext'
import {err} from '../utils/debug'
import {BATTLE_ADDRESS, VIEWER_ADDRESS} from '../utils/env'
import type {Piece, PieceId, Pieces, RawNewWeaponEvent, RawPiece} from '../utils/pieces'
import {parseRawNewWeaponEvent} from '../utils/pieces'
import {parseRawPiece} from '../utils/pieces'
import {UINT32_MAX} from '../utils/constants/solidity'
import Battle from '../abi/Battle.json'
import type {MoveEvent} from '../utils/events'

const playerAndWeapon = (m: MoveEvent): PieceId[] =>
  m.data !== 0 && m.data < UINT32_MAX
    ? [m.pieceId, m.data]
    : [m.pieceId]

export const useGetPieces = () => {
  const {board, moves, pieces, updatePieces} = useGame()
  const boardIds = Object.values(board).filter(sq => sq != null)
  const weaponIds = pieces == null ? [] : Object.values(pieces).map(p => p.weapon)
  const moveIds = moves.flatMap(playerAndWeapon)
  const allIds = [...boardIds, ...weaponIds, ...moveIds].filter(i => i !== 0 && i !== (UINT32_MAX - 1))

  useContractEvent({
    addressOrName: BATTLE_ADDRESS,
    contractInterface: Battle,
    eventName: 'NewWeapon',
    listener(data: RawNewWeaponEvent) {
      const parsed = parseRawNewWeaponEvent(data)
      // Merge weapon stats into `pieces`
      updatePieces(ps => ({
        ...ps,
        [parsed.id]: ps?.[parsed.id]
          ? {...ps[parsed.id], stats: parsed.stats}
          : {...parsed},
      }))
    },
  })

  return useContractRead({
    addressOrName: VIEWER_ADDRESS,
    contractInterface: BattleViewer,
    functionName: 'getPieces',
    args: [[...new Set(allIds)]],
    onSuccess(data) {
      if (!data) {
        // Return is there is no result
        // or board is empty (every value is undefined/null)
        // or if we already have pieces
        return
      }

      const pieceData = (data as RawPiece[])
        .filter(xs => !xs.every(x => Array.isArray(x) || x === 0)) // Filter out dead weapons
        .reduce((acc, cur) => ({
          ...acc,
          [cur[0]]: parseRawPiece(cur),
        }), {})
      updatePieces(ps => {
        if (ps == null) {
          return pieceData
        }

        return Object.entries(pieceData)
          .reduce((acc: Pieces, [k, v]) => {
            const pieceId = parseInt(k, 10)
            const piece = v as Piece
            // Don't erase weapon stats if they're already there (NewWeapon events)
            return {
              ...acc,
              [pieceId]: ps?.[pieceId]
                ? {...ps[pieceId], ...piece}
                : {...piece},
            }
          }, {})
      })
    },
    onError(er) {
      err('error getting pieces', er)
    },
  })
}
