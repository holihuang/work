'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
let BowerWebpackPlugin = require('bower-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

let config = Object.assign({}, baseConfig, {
  entry: {
    index:[
      './src/index'
    ],
    vendor: [ 'react', 'react-dom', 'react-router', 'react-redux', 'redux', 'redux-saga', 'reselect'
            ,'redux-actions', 'moment', 'numeral']
  },
  cache: false,
  devtool: 'sourcemap',
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new ExtractTextPlugin("[name].css"),
    new BowerWebpackPlugin({
      searchResolveModulesDirectories: false
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /^\.\/zh\-cn$/),
    // //生成vendor chunk，抽取第三方模块单独打包成独立的chunk
    // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.[hash].js'),
    // //抽取webpack loader公共部分的代码到manifest.js中，避免每次打包时hash发生变化
    new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     filename: 'vendor.js',
    //     chunks: ['index', 'vendor']
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'manifest',
    //     filename: 'manifest.js', //仅包含webpack运行时环境和映射表
    //     chunks: ['vendor']
    // }),
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.js'),
    new webpack.optimize.UglifyJsPlugin(),
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index_dist.html',
      filename: '../index.html',
      hash: true
    }),
    new webpack.NoErrorsPlugin()
  ],
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.loaders.push({
  test: /\.(js|jsx)$/,
  loader: 'babel',
  include: [].concat(
    config.additionalPaths,
    [ path.join(__dirname, '/../src') ]
  )
});

module.exports = config;
