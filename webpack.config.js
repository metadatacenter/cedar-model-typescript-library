const path = require('path');

// webpack's default size advice is aimed at what a browser downloads before
// first paint, and 244 KiB is not a useful ceiling for a model library a
// consumer bundles into its own application. The limits are named here so a real
// regression still warns: the largest of the three outputs is 387 KiB today.
const performance = {
  maxAssetSize: 512000,
  maxEntrypointSize: 512000,
};

module.exports = [
  // CommonJS Output
  {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2', // CommonJS output
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    mode: 'production',
    performance,
    devtool: 'source-map', // Generate source maps
  },

  // ES Module Output
  {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.esm.js',
      // Without this the bundle exports nothing but `default`: webpack builds
      // an ES module and then keeps the entry's named exports to itself, so
      // `import { CedarReaders } from 'cedar-model-typescript-library'`
      // resolves to undefined at runtime and fails on first use. The package
      // manifest pointed `main` at the CommonJS build, so nothing consumed this
      // file and nothing noticed.
      library: { type: 'module' },
    },
    experiments: {
      outputModule: true, // Native ES Module output
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    mode: 'production',
    performance,
    devtool: 'source-map',
  },

  // UMD Output
  {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.umd.js',
      library: 'CedarModelTypescriptLibrary', // Global name for UMD builds
      libraryTarget: 'umd', // UMD format for browser, AMD, and Node.js
      globalObject: 'this', // Necessary for UMD to work in both Node.js and browser
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    mode: 'production',
    performance,
    devtool: 'source-map',
  },
];
