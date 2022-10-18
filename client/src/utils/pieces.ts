import {PLAYER, WEAPON, MAXTOKENS, IPFS_URI_SUFFIX} from './constants'
import {debug} from './debug'
import type {RawStats, StatsRecord} from './stats'
import {parseRawStats} from './stats'
import {doomiesMetadata} from './doomies-metadata'

export type RawPiece = [
  number, // Id
  number, // Weapon id
  number, // Kills
  number, // Gameid
  number, // Lastmove
  number, // Player (0), weapon (1)
  number, // X
  number, // Y
  RawStats, // Player or weapon stats
  string, // Name
]

export type RawNewWeaponEvent = [number, RawStats, number]

export type NewWeaponEvent = {
  id: number;
  stats: StatsRecord;
  gameId: number;
}

export type PieceType = typeof PLAYER | typeof WEAPON

// Just an alias but conveys intention
export type PieceId = number

export type Piece = {
  id: PieceId;
  weapon: number;
  kills: number;
  gameId: number;
  lastMove: number;
  pieceType: PieceType;
  x: number;
  y: number;
  stats: StatsRecord;
  name: string;
  image: string;
}

export type Pieces = Record<PieceId, Piece | Partial<Piece>>

export const weaponNamesPretty = [
  'Granny\'s pushpin',
  'Burning matchstick',
  'Rusty scissors',
  'Grimey key',
  'Vintage syringe',
  'Slimy brick',
  'Dad\'s screwdriver',
  'Bloody dental floss',
]

export const weaponNamesSystem = [
  'grannys_pushpin',
  'burning_matchstick',
  'rusty_scissors',
  'grimey_key',
  'vintage_syringe',
  'slimy_brick',
  'dads_screwdriver',
  'bloody_dental_floss',
]

const getPieceName = (id: number) => {
  if (id > MAXTOKENS) {
    return weaponNamesPretty[(id - MAXTOKENS - 1) % 8]
  }

  return `Doomie #${id}`
}

const getDoomieImageUri = (id: number) => {
  const ipfsImageUri = doomiesMetadata[id].image
  const ipfsHash = ipfsImageUri.split('ipfs://')
  return `${IPFS_URI_SUFFIX}${ipfsHash[1]}`
}

export const getPieceImage = (id: number, getFullWeapon = true) => {
  if (id > MAXTOKENS && getFullWeapon) {
    return `/images/weapons/${weaponNamesSystem[(id - MAXTOKENS - 1) % 8]}_standalone.webp`
  }

  if (id > MAXTOKENS && !getFullWeapon) {
    return `/images/weapons/${weaponNamesSystem[(id - MAXTOKENS - 1) % 8]}.webp`
  }

  return getDoomieImageUri(id)
}

export const getPieceWeaponStats = (ps: Pieces | undefined, p: Piece | undefined) =>
  p && p.pieceType === PLAYER
    ? ps
      ? ps[p.weapon]?.stats ?? undefined
      : undefined
    : undefined

export const parseRawPiece = (piece: RawPiece): Piece =>
  ({
    id: piece[0],
    weapon: piece[1],
    kills: piece[2],
    gameId: piece[3],
    lastMove: piece[4],
    pieceType: piece[5] === 0 ? PLAYER : WEAPON,
    x: piece[6],
    y: piece[7],
    stats: parseRawStats(piece[8]),
    name: getPieceName(piece[0]),
    image: getPieceImage(piece[0]),
  })

export const parseRawNewWeaponEvent = (re: RawNewWeaponEvent): NewWeaponEvent =>
  ({
    id: re[0],
    stats: parseRawStats(re[1]),
    gameId: re[2],
  })
