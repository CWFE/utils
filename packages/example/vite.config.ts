import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig({
// @ts-ignore
    plugins: [react(), WindiCSS()],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    }
})
