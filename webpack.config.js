const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const outputPath = 'dist';

module.exports = (config) => {
  const isEnvDevelopment = config.mode === 'development';
  return {
    entry: {
      'copy-paste-styles': './src/js/copy-paste-styles.js',
    },
    output: {
      path: path.resolve(__dirname, outputPath),
      filename: 'js/[name].js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new DependencyExtractionWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: 'readme.txt', to: '' },
          {
            from: 'src/*.php',
            to({ context, absoluteFilename }) {
              return '[name][ext]';
            },
          },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [{ loader: require.resolve('babel-loader') }],
        },
        {
          test: /\.s?[c]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/i,
          use: 'url-loader?limit=1024',
        },
      ],
    },
    optimization: {
      sideEffects: true,
      runtimeChunk: false,
      providedExports: true,
      innerGraph: true,
      concatenateModules: !isEnvDevelopment,
      usedExports: true,
      usedExports: !isEnvDevelopment,
      removeEmptyChunks: true,
    },
  };
};
