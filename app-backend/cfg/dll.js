const path = require('path')
const webpack = require('webpack')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const defaultSettings = require('./defaults')

const config = Object.assign({}, {
    mode: 'production',
    entry: {
        vendor: [
            'jquery', 'react', 'prop-types', 'lodash', 'backbone', 'moment', 'underscore', 'antd',
            'react-dom', 'datepicker/js/bootstrap-datetimepicker', '@sunl-fe/dataservice', '@sunl-fe/wangeditor', 'copy-to-clipboard', 'react-pdf',
        ],
    },
    output: {
        path: path.join(__dirname, '/../dist/assets/'),
        filename: 'dll.[name].js',
        library: '[name]_[chunkhash]',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        // new UglifyJsPlugin({
        //     cache: true,
        //     parallel: true,
        //     sourceMap: true,
        // }),
        new webpack.DllPlugin({
            path: path.join(__dirname, '/../dist/assets/', '[name]-manifest.json'),
            name: '[name]_[chunkhash]',
            context: path.join(__dirname, '/../dist/'),
        }),
    ],
    resolve: {
        extensions: ['.js'],
        alias: {
            datepicker: `${defaultSettings.srcPath}/lib/datepicker`,
        },
    },
})

module.exports = config
