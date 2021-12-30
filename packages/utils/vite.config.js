const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'libs/index.ts'),
            name: '@cwfe/util',
            fileName: (format) => `util.${format}.js`
        },
        rollupOptions: {
            external: ['axios' ,'react']
        }
    }
})
