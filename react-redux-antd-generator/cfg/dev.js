const path = require('path')
const webpack = require('webpack')

const baseConfig = require('./base')
const defaultSettings = require('./defaults')

const plugins = defaultSettings.getDefaultPlugins().concat([
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('develop'),
        'process.env.COMPILE_ENV': JSON.stringify('dev'),
    }),
])

const lessLoaderObj = {
    loader: 'less-loader',
    options: {
        javascriptEnabled: true,
        modifyVars: { '@icon-url': '/iconfont/iconfont' },
    },
}

const modules = defaultSettings.getDefaultModules()
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
            lessLoaderObj,
        ],
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
            'style-loader',
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
        path: path.join(__dirname, '/../dist/assets/'),
        filename: '[name].js',
        publicPath: `${defaultSettings.publicPath}`,
    },
    cache: true,
    devtool: 'cheap-module-source-map',
    plugins,
    module: modules,
    mode: 'development',
})

module.exports = config
