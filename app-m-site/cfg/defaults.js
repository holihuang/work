'use strict';
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const srcPath = path.join(__dirname, '/../src');
const dfltPort = 8991;
function getDefaultModules() {
  return {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        include: srcPath,
        loader: 'eslint-loader'
      }
      ],
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader",  { publicPath: './'})
      },
      {
          test: /\.less$/,
          include: path.join(srcPath, 'styles/less'),
          loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]!less-loader!postcss-loader",  { publicPath: './'})
      },
      {
          test: /\.less$/,
          exclude: path.join(srcPath, 'styles/less'),
          loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader!postcss-loader",  { publicPath: './'})
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(mp4|ogg)$/,
        loader: 'file-loader'
      }
    ]
  };
}
module.exports = {
  srcPath: srcPath,
  publicPath: '/assets/',
  port: dfltPort,
  getDefaultModules: getDefaultModules,
  postcss: function () {
    return [];
  }
};
