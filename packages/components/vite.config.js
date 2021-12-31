const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        lib: {
            formats: ['es'],
            entry: path.resolve(__dirname, 'libs/index.ts'),
            name: '@cwfe/component',
            fileName: (format) => `component.${format}.js`
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'axios']
        }
    }
})
