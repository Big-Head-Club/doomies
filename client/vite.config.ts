import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        // https://github.com/family/connectkit/blob/57b888fa87b0b3566dd48d1308b3b514b3442a39/packages/connectkit/src/components/ConnectKit.tsx#L103
        global: 'globalThis'
      }
    }
  }
})
