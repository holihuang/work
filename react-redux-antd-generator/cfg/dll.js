const path = require('path')
const webpack = require('webpack')
const defaultSettings = require('./defaults')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const config = Object.assign({}, {
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    entry: {
        vendor: defaultSettings.vendor,
    },
    output: {
        path: path.join(__dirname, '/../dist/assets/'),
        filename: 'dll.[name].js',
        library: '[name]_[hash]',
    },
    devtool: 'source-map',
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        // new UglifyJsPlugin({
        //     sourceMap: true,
        // }),
        new webpack.DllPlugin({
            path: path.join(__dirname, '/../dist/assets/', '[name]-manifest.json'),
            name: '[name]_[hash]',
            context: path.join(__dirname, '/../dist/'),
        }),
    ],
})

module.exports = config
