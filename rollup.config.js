const nodeResolve = require('@rollup/plugin-node-resolve');
const alias = require('@rollup/plugin-alias');
const loadLocalePlugin = require('./load-locales.js');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/mapml/index.js',
  plugins: [
    nodeResolve(),
    loadLocalePlugin(),
    alias({
      entries: [
        {
          find: 'leaflet',
          replacement: 'leaflet/dist/leaflet-src.esm.js'
        }
      ]
    }),
    terser({
        compress: true,
        mangle: true,
        format: {
          comments: false
        },
        sourceMap: true // Maintain source maps even during minification
      })
  ],
  output: {
    file: 'dist/mapml.js',
    format: 'esm',
    sourcemap: true
  }
};
