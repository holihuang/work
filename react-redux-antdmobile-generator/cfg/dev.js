const path = require('path')
const webpack = require('webpack')

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

const plugins = defaultSettings.getDefaultPlugins().concat([
    new webpack.HotModuleReplacementPlugin(),
])
const modules = defaultSettings.getDefaultModules()
const theme = require('../package.json').theme

modules.rules = modules.rules.concat([
    {
        test: /\.(js|jsx)$/,
        use: [
            {
                loader: 'babel-loader',
            },
        ],
        include: [path.join(__dirname, '../src')],
    },
    {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader',
        ]
    },
    {
        test: /\.less$/,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                    importLoaders: 2,
                    localIdentName: '[name]__[local]___[hash:base64:5]'
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    config: {
                        path: 'path/to/postcss.config.js'
                    }
                }
            },
            'less-loader',
        ],
        include: [path.join(__dirname, '../src')],
    },
    {
        test: /\.less$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    config: {
                        path: 'path/to/postcss.config.js'
                    }
                }
            },
            {
                loader: 'less-loader',
                options: {
                    modifyVars: theme
                }
            },
        ],
        include: [path.join(__dirname, '../node_modules')],
    },
])
const config = Object.assign({}, baseConfig, {
    entry: {
        index:[
            'webpack-dev-server/client?http://0.0.0.0:' + defaultSettings.port,
            'webpack/hot/only-dev-server',
            './src/index'
        ],
        // vendor: defaultSettings.vendor,
    },
    output: {
        path: path.join(__dirname, '/../dist/assets/'),
        filename: '[name].js',
        publicPath: `.${defaultSettings.publicPath}`,
    },
    cache: true,
    devtool: 'cheap-module-eval-source-map',
    plugins,
    module: modules,
})

module.exports = config
