import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // the Chrome container reaches Vite through this hostname
    allowedHosts: ['host.docker.internal'],
    // /mnt/c does not emit inotify events to WSL
    watch: { usePolling: true },
  },
})
