

const HappyPack = require('happypack')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const srcPath = path.join(__dirname, '/../src')
const dfltPort = 9881
// const manifest = require('../dist/assets/vendor-manifest.json')

function getDefaultModules() {
    return {
        rules: [
            {
                test: /\.css$/,
                use: 'happypack/loader?id=css',
                // use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less/,
                use: 'happypack/loader?id=less',
                // include: [ path.join(__dirname, '/../src') ]
                // use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.html$/,
                use: 'happypack/loader?id=html',
                include: [path.join(__dirname, '/../src')],
                // use: ['mustache-loader']
            },
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        // name: '../images/[name].[ext]',
                    },
                }],
            },
            // // 图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
            // {
            //     test: /\.(ico)$/,
            //     loader: 'url-loader',
            //     options: {
            //         limit: 50,
            //         name: '../../[name].[ext]', // 相对于path的路径
            //     },
            // },
            {
                test: /\.(mp4|ogg|svg)$/,
                use: ['file-loader'],
            },
        ],
    }
}

function getDefaultPlugins() {
    return [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname, '/../dist/'),
            manifest: require('../dist/assets/vendor-manifest.json'), // eslint-disable-line
        }),
        new HappyPack({
            id: 'css',
            threads: 4,
            loaders: ['style-loader', 'css-loader'],
        }),

        new HappyPack({
            id: 'less',
            threads: 4,
            loaders: ['style-loader', 'css-loader', 'less-loader'],
        }),

        new HappyPack({
            id: 'html',
            threads: 4,
            loaders: ['mustache-loader'],
        }),

        new HappyPack({
            id: 'js',
            loaders: ['babel-loader'],
            threads: 4,
        }),
    ]
}

module.exports = {
    srcPath,
    publicPath: '/assets/',
    port: dfltPort,
    getDefaultModules,
    getDefaultPlugins,
    postcss() {
        return []
    },
}
