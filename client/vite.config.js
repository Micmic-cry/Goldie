import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // <<<--- ADD OR MODIFY THIS SECTION
    host: true, // Allows Vite to listen on all public IPs (like yours)
    // Alternatively, you can use '0.0.0.0'
    // host: '0.0.0.0',
    port: 5173 // Optional: explicitly set the port if needed
  }
})