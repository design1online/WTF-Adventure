const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ModernizrWebpackPlugin = require('modernizr-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, './src/client/js/main.js'),
      path.resolve(__dirname, './assets/data/maps/world_client.js'),
    ],
    assets: [
      // stylesheets
      path.resolve(__dirname, './css/main.scss'),
      // client config
      path.resolve(__dirname, './src/client/config.json'),
      // data
      path.resolve(__dirname, './assets/data/sprites.json'),
      // maps
      path.resolve(__dirname, './assets/data/maps/world_client.json'),
    ],
    vendor: [
      'socket.io-client',
      'jquery',
      'bootstrap',
      'popper.js',
      'underscore',
    ],
  },
  resolve: {
    alias: {
      jquery: 'jquery/src/jquery',
    },
  },
  devtool: 'cheap-source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    library: '[name]',
    libraryTarget: 'umd',
    filename: '[name].js',
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'windows.jQuery': 'jquery',
    }),
    // new HtmlWebpackPlugin({
    //   filename: '../index.html',
    //   template: './src/client/index.html',
    //   chunks: ['vendor', 'app', 'assets'],
    //   chunksSortMode: 'manual',
    //   minify: {
    //     removeAttributeQuotes: false,
    //     collapseWhitespace: false,
    //     html5: false,
    //     minifyCSS: false,
    //     minifyJS: false,
    //     minifyURLs: false,
    //     removeComments: false,
    //     removeEmptyAttributes: false,
    //   },
    //   hash: false,
    // }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new BrowserSyncPlugin({
      host: process.env.IP || 'localhost',
      port: process.env.PORT || 3000,
      // proxy: 'http://localhost:3100/',
      server: {
        baseDir: ['./build', './', './assets'],
      },
      socket: {
        clients: {
          heartbeatTimeout: 80000,
        },
      },
      watchOptions: {
        awaitWriteFinish: true,
      },
    }),
    // new ModernizrWebpackPlugin({
    //   "minify": true,
    //   "feature-detects": ['input', 'canvas', 'css/resize']
    // }),
  ],
  module: {
    rules: [
      // javascript files
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src'),
      },
      // raw files
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader',
      },
      // css
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // images
      {
        test: /.(jpg|png|gif)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        }],
      },
      // audio
      {
        test: /\.mp3$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        }],
        include: path.join(__dirname, 'assets'),
      },
      // fonts
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        }],
        include: path.join(__dirname, 'assets/fonts'),
      },
    ],
  },
};
