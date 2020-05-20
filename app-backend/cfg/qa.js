

const path = require('path')
const webpack = require('webpack')

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

// Add needed plugins here
const BowerWebpackPlugin = require('bower-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = Object.assign({}, baseConfig, {
    mode: 'production',
    entry: {
        index: [
            './src/index',
        ],
        vendor: ['jquery', 'underscore', 'backbone', 'bootstrap'],
    },
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].[chunkhash].js',
        chunkFilename: '[chunkhash].js',
        publicPath: `.${defaultSettings.publicPath}`,
    },
    cache: false,
    devtool: 'sourcemap',
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"qa"',
        }),
        new ExtractTextPlugin('[name].css'),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false,
        }),

        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest'],
        }),

        // new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new HtmlWebpackPlugin({
            title: 'index',
            filename: '../index.html',
            template: 'src/template.html',
        }),
        new webpack.NoErrorsPlugin(),
    ],
    module: defaultSettings.getDefaultModules(),
})

// Add needed loaders to the defaults here
config.module.loaders.push({
    test: /\.(js)$/,
    loader: 'babel',
    include: [].concat(
        config.additionalPaths,
        [path.join(__dirname, '/../src')],
    ),
})

module.exports = config
