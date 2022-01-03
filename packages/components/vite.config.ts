import path from 'path'
import { defineConfig } from 'vite'

module.exports = defineConfig({
    resolve: {
        dedupe: ['html2canvas']
    },
    build: {
        lib: {
            formats: ['es'],
            entry: path.resolve(__dirname, 'libs/index.ts'),
            name: '@cwfe/component',
            fileName: (format) => `component.${ format }.js`
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'axios', 'lodash', 'antd'],
            output: {
                hoistTransitiveImports: false
            }
        }
    }
})
