

// const HappyPack = require('happypack')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const path = require('path')
const webpack = require('webpack')
const baseConfig = require('./base')
const defaultSettings = require('./defaults')

const config = Object.assign({}, baseConfig, {
    mode: 'development',
    entry: {
        // common: [
        //     './src/common/common',
        //     './src/common/service'
        // ],
        index: [
            `webpack-dev-server/client?http://localhost:${defaultSettings.port}`,
            'webpack/hot/only-dev-server',
            './src/index',
        ],
    },
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].js',
        publicPath: `.${defaultSettings.publicPath}`,
    },
    cache: true,
    devtool: 'cheap-module-eval-source-map', // sourcemap
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"dev"',
            },
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new webpack.HotModuleReplacementPlugin(),
        // new BundleAnalyzerPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: "common",
        //     minChunks: Infinity
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //   compress: {
        //     warnings: false,
        //       //screw_ie8: true
        //   },
        //   output: {comments: false}
        // }),
        new webpack.NoEmitOnErrorsPlugin(),
        // new HappyPack({
        //     id: 'js',
        //     loaders: ['babel-loader'],
        //     threads: 4,
        // }),
        new HardSourceWebpackPlugin({
            // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中，因此如
            // 果清除了node_modules，则缓存也是如此
            cacheDirectory: '../devCache/.cache/hard-source/[confighash]',
            // Either an absolute path or relative to webpack's options.context.
            // Sets webpack's recordsPath if not already set.
            recordsPath: '../devCache/.cache/hard-source/[confighash]/records.json',
            // configHash在启动webpack实例时转换webpack配置，并用于cacheDirectory为不同的webpack配
            // 置构建不同的缓存
            configHash: webpackConfig => (
                // node-object-hash on npm can be used to build this.
                require('node-object-hash')({ sort: false }).hash(webpackConfig)
            ),
            // 当加载器，插件，其他构建时脚本或其他动态依赖项发生更改时，hard-source需要替换缓存以确保输
            // 出正确。environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
            environmentHash: {
                root: process.cwd(),
                directories: [],
                files: ['package-lock.json', 'yarn.lock'],
            },
        }),
        ...defaultSettings.getDefaultPlugins(),
    ],
    module: defaultSettings.getDefaultModules(),
})


config.module.rules.push({
    test: /\.(js|jsx)$/,
    use: 'happypack/loader?id=js',
    // use: ['babel-loader'],
    include: [path.join(__dirname, '/../src')],
    exclude: [path.join(__dirname, '/../src/lib')],
})

module.exports = config
