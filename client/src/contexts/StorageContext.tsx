import type {ReactNode} from 'react'
import {useEffect} from 'react'
import {useCallback} from 'react'
import {createContext, useContext, useMemo, useReducer} from 'react'
import {useAccount} from 'wagmi'
import {UPDATEFRESHBATTLES, UPDATESTALEBATTLES} from '../utils/constants/storage-event'
import type {BattleLogEvent} from '../utils/events'

export type BattleIndex = {blockNumber: number; logIndex: number}

type Event =
  | {type: typeof UPDATESTALEBATTLES; payload: (bs: BattleIndex[]) => BattleIndex[]}
  | {type: typeof UPDATEFRESHBATTLES; payload: (bs: BattleIndex[]) => BattleIndex[]}

type Dispatch = (event: Event) => void;

export type State = {
  staleBattles: Array<{blockNumber: number; logIndex: number}>;
  freshBattles: Array<{blockNumber: number; logIndex: number}>;
}

const StorageContext = createContext<{state: State; dispatch: Dispatch} | undefined>(undefined)

function storageReducer(state: State, event: Event): State {
  switch (event.type) {
  case UPDATESTALEBATTLES:
    return {...state, staleBattles: event.payload(state.staleBattles)}
  case UPDATEFRESHBATTLES:
    return {...state, freshBattles: event.payload(state.freshBattles)}
  default:
    return state
  }
}

type StorageProviderProps = {children: ReactNode}

function StorageProvider({children}: StorageProviderProps) {
  const {address} = useAccount()
  const key = address ? `@doomies/storage-${address}` : undefined
  const [state, dispatch] = useReducer(
    storageReducer,
    {staleBattles: [], freshBattles: []},
    initialState => {
      const stored = key ? localStorage.getItem(key) : undefined
      return stored ? JSON.parse(stored) as State : initialState
    },
  )

  useEffect(() => {
    if (key) {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state])

  const value = useMemo(() => ({state, dispatch}), [state, dispatch])

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

function useStorage() {
  const context = useContext(StorageContext)
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider')
  }

  const {state, dispatch} = context

  const updateStaleBattles = useCallback((payload: (bs: BattleIndex[]) => BattleIndex[]) => {
    dispatch({type: UPDATESTALEBATTLES, payload})
  }, [dispatch])

  const updateFreshBattles = useCallback((payload: (bs: BattleIndex[]) => BattleIndex[]) => {
    dispatch({type: UPDATEFRESHBATTLES, payload})
  }, [dispatch])

  const isStaleBattle = useCallback((b: BattleLogEvent) =>
    state.staleBattles.some(({blockNumber, logIndex}) => blockNumber === b.blockNumber && logIndex === b.logIndex)
  , [state])

  const isFreshBattle = useCallback((b: BattleLogEvent) =>
    state.freshBattles.some(({blockNumber, logIndex}) => blockNumber === b.blockNumber && logIndex === b.logIndex)
  , [state])

  return {
    ...state,
    updateStaleBattles,
    updateFreshBattles,
    isStaleBattle,
    isFreshBattle,
  }
}

export {StorageProvider, useStorage}
