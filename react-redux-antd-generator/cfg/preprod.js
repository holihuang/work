const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

const plugins = defaultSettings.getDefaultPlugins().concat([
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"preprod"',
    }),
    new HtmlWebpackPlugin({
        template: 'src/index_dist.html',
        filename: '../index.html',
    }),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new AddAssetHtmlPlugin([
        {
            filepath: path.join(__dirname, "/../dist/assets/dll.vendor.js"),
            hash: true,
            includeSourcemap: false
        }
    ]),
    new webpack.DllReferencePlugin({
            context: path.join(__dirname, "/../dist/"),
            manifest: require("../dist/assets/vendor-manifest.json")
    }),
    // new webpack.optimize.ModuleConcatenationPlugin(),
])
const modules = defaultSettings.getDefaultModules()
modules.rules = modules.rules.concat([
    {
        test: /\.(js|jsx)$/,
        use: [
            {
                loader: 'babel-loader',
            },
        ],
        include: [path.join(__dirname, '/../src')],
    },
    {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
            publicPath: './',
        }),
    },
    // {
    //     test: /\.less$/,
    //     use: ExtractTextPlugin.extract({
    //         fallback: 'style-loader',
    //         use: ['css-loader?modules&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]', 'less-loader'],
    //         publicPath: './',
    //     }),
    // },
    {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader?modules&importLoaders=2&localIdentName=[name]__[local]___[hash:base64:5]', 'less-loader'],
            publicPath: './',
        }),
        include: [path.join(__dirname, '../src')],
    },
    {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'less-loader'],
            publicPath: './',
        }),
        include: [path.join(__dirname, '../node_modules')],
    }
]


)

const config = Object.assign({}, baseConfig, {
    entry: {
        index:[
            './src/index'
        ],
        // vendor: defaultSettings.vendor,
    },
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].[chunkhash].js',
        publicPath: `.${defaultSettings.publicPath}`,
    },
    cache: false,
    devtool: 'cheap-module-source-map',
    plugins,
    module: modules,
})

module.exports = config
