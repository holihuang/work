

const path = require('path')
const webpack = require('webpack')

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

// Add needed plugins here
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const manifest = require('../dist/assets/vendor-manifest.json')

const config = Object.assign({}, baseConfig, {
    mode: 'production',
    entry: {
        index: [
            './src/index',
        ],
    },
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].[chunkhash].js',
        chunkFilename: '[chunkhash].js',
        publicPath: `.${defaultSettings.publicPath}`,
    },
    cache: false,
    devtool: 'source-map',
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"test"',
        }),
        // new ExtractTextPlugin("[name].css"),

        // 这个uglify会导致recorder源码出错，先注释掉
        // new UglifyJsPlugin({
        //     sourceMap: true,
        // }),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new HtmlWebpackPlugin({
            title: 'index',
            filename: '../index.html',
            template: 'src/template.html',
        }),
        new AddAssetHtmlPlugin([
            {
                filepath: path.join(__dirname, '/../dist/assets/dll.vendor.js'),
                hash: true,
                includeSourcemap: false,
            },
        ]),
        new webpack.NoEmitOnErrorsPlugin(),
        // new webpack.DllReferencePlugin({
        //     context: path.join(__dirname, '/../dist/'),
        //     manifest: require('../dist/assets/vendor-manifest.json'), // eslint-disable-line
        // }),
        ...defaultSettings.getDefaultPlugins(),
    ],
    module: {
        ...defaultSettings.getDefaultModules(),
    },
    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/,
    //             use: ['style-loader', 'css-loader'],
    //         },
    //         {
    //             test: /\.less/,
    //             use: ['style-loader', 'css-loader', 'less-loader'],
    //         },
    //         {
    //             test: /\.html$/,
    //             use: ['mustache-loader'],
    //             include: [path.join(__dirname, '/../src')],
    //         },
    //         {
    //             test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
    //             use: [{
    //                 loader: 'url-loader',
    //                 options: {
    //                     limit: 8192,
    //                 },
    //             }],
    //         },
    //         {
    //             test: /\.(mp4|ogg|svg)$/,
    //             use: ['file-loader'],
    //         },
    //         {
    //             test: /\.(js|jsx)$/,
    //             use: ['babel-loader'],
    //             include: [path.join(__dirname, '/../src')],
    //             exclude: [path.join(__dirname, '/../src/lib')],
    //         },
    //     ],
    // },
    // optimization: {
    //     minimizer: [new UglifyJsPlugin()],
    // },
})

config.module.rules.push({
    test: /\.(js|jsx)$/,
    use: 'happypack/loader?id=js',
    // use: ['babel-loader'],
    include: [path.join(__dirname, '/../src')],
    exclude: [path.join(__dirname, '/../src/lib')],
})

module.exports = config
