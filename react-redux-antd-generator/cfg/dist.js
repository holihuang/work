const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

// the path(s) that should be cleaned
const pathsToClean = [
    'assets',
]

// the clean options to use
const cleanOptions = {
    root: `${__dirname}/../dist`,
    exclude: ['dll.vendor.js', 'vendor-manifest.json'],
}

const lessLoaderObj = {
    loader: 'less-loader',
    options: {
        javascriptEnabled: true,
        modifyVars: { '@icon-url': '/iconfont/iconfont' },
    },
}

const miniCSSLoaderObj = {
    loader: MiniCSSExtractPlugin.loader,
    options: {
        publicPath: './',
    },
}

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

const plugins = defaultSettings.getDefaultPlugins().concat([
    new CleanWebpackPlugin(pathsToClean, cleanOptions),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.COMPILE_ENV': JSON.stringify(process.env.COMPILE_ENV),
    }),
    new HtmlWebpackPlugin({
        template: 'src/index_dist.html',
        filename: '../index.html',
    }),
    new MiniCSSExtractPlugin({
        filename: '[name].[hash].css',
    }),
    new AddAssetHtmlPlugin([
        {
            filepath: path.join(__dirname, '/../dist/assets/dll.vendor.js'),
            hash: true,
            includeSourcemap: false,
        },
    ]),
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
        use: [
            miniCSSLoaderObj,
            'css-loader',
        ],
    },
    {
        test: /\.less$/,
        use: [
            miniCSSLoaderObj,
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                    importLoaders: 2,
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                },
            },
            lessLoaderObj,
        ],
        include: [path.join(__dirname, '../src')],
    },
    {
        test: /\.less$/,
        use: [
            miniCSSLoaderObj,
            'css-loader',
            lessLoaderObj,
        ],
        include: [path.join(__dirname, '../node_modules')],
    },
])

const config = Object.assign({}, baseConfig, {
    entry: {
        index: [
            './src/index',
        ],
    },
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].[hash].js',
        publicPath: `${defaultSettings.publicPath}`,
    },
    cache: false,
    devtool: 'source-map',
    plugins,
    module: modules,
    mode: 'production',
})

module.exports = config
