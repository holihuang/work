const path = require('path')
const webpack = require('webpack')
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin')

const srcPath = path.join(__dirname, '../src')
const dfltPort = 8226
const publicPath = '/assets/'

function getDefaultModules() {
    return {
        rules: [
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                        },
                    },
                ],
            },
            {
                test: /\.(mp4|ogg)$/,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    }
}

const getDefaultPlugins = () => [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DllReferencePlugin({
        context: path.join(__dirname, '/../dist/'),
        // eslint-disable-next-line
        manifest: require('../dist/assets/vendor-manifest.json'),
    }),
    new CaseSensitivePlugin(),
]
const vendor = [
    'react', 'react-dom', 'react-router',
    'react-router-config', 'react-router-redux',
    'prop-types', 'moment',
    'babel-polyfill', 'history',
    'react-router-dom', 'react-redux',
    'redux', 'redux-saga', 'reselect',
    'redux-actions', 'antd', 'classnames',
]

module.exports = {
    srcPath,
    port: dfltPort,
    getDefaultModules,
    getDefaultPlugins,
    publicPath,
    vendor,
}
