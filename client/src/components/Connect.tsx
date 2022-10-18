import {ConnectKitButton} from 'connectkit'
import Button from './Button'

export default function Connect() {
  return (
    <ConnectKitButton.Custom>
      {({isConnected, isConnecting, show, address, ensName}) => (
        <Button
          text={
            isConnecting
              ? 'connecting...'
              : isConnected
                ? ensName ?? address ?? 'connected'
                : 'join'
          }
          onClick={() => {
            show?.()
          }}
        />
      )}
    </ConnectKitButton.Custom>
  )
}
