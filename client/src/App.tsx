import type {Chain} from 'wagmi'
import {WagmiConfig, createClient, chain} from 'wagmi'
import {ConnectKitProvider, getDefaultClient} from 'connectkit'
import Game from './routes/Game'
import {GameProvider} from './contexts/GameContext'
import {debug} from './utils/debug'
import {StorageProvider} from './contexts/StorageContext'

// eslint-disable-next-line @typescript-eslint/naming-convention
const ALCHEMY_ID = import.meta.env.VITE_ALCHEMY_ID as string
// eslint-disable-next-line @typescript-eslint/naming-convention
const TUNNEL_URI = import.meta.env.VITE_TUNNEL_URI as string
// eslint-disable-next-line @typescript-eslint/naming-convention
const NETWORK_CHAIN = import.meta.env.VITE_NETWORK_CHAIN as Chains

debug('NETWORK_CHAIN', NETWORK_CHAIN)

type Chains = 'hardhat' | 'localhost' | 'mumbai' | 'polygon' | 'tunnel'

const chainsByName: Record<Chains, Chain[]> = {
  hardhat: [chain.hardhat],
  localhost: [chain.localhost],
  mumbai: [chain.polygonMumbai],
  polygon: [chain.polygon],
  tunnel: [{
    id: 1337,
    name: 'Tunnel',
    network: 'tunnel',
    rpcUrls: {
      default: TUNNEL_URI,
    },
  }],
}

const chains = chainsByName[NETWORK_CHAIN]

debug('All available chains are', chain)
debug('We\'re using chain', chains)

const getAlchemyId = (network: string) => {
  if (network === 'localhost' || network === 'tunnel') {
    return undefined
  }

  return ALCHEMY_ID
}

const client = createClient(
  getDefaultClient({
    appName: 'Doomies',
    alchemyId: getAlchemyId(chains[0]?.network),
    chains,
  }),
)

function App() {
  const boardSide = 9
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <StorageProvider>
          <GameProvider side={boardSide}>
            <Game side={boardSide}/>
          </GameProvider>
        </StorageProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
