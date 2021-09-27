const nodeExternals = require('webpack-node-externals');

module.exports = {
   entry: ['babel-polyfill', './dist/index.js'],
   externals: [nodeExternals({
      // allowlist: ['tslib', 'ws', 'bcrypt', 'node-pre-gyp'],
   })], // in order to ignore all modules in node_modules folder
   target: 'node',
   output: {
      path: __dirname + '/build',
      filename: 'kcl.js',
      // libraryTarget: 'var',
      // library: '',
   },
   node: {
      global: false,
      __filename: false,
      __dirname: false,
   },
   module: {
      rules: [{
         test: /\.js$/,
         exclude: /node_modules/,
         use: [{
            loader: 'babel-loader',
            options: {
               presets: ['@babel/preset-env']
            }
         }],

      }],
   }
};