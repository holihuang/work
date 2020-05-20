const path = require('path')
const fs = require('fs')
const LoginSSO = require('@sunl-fe/login-sso')
const _ = require('lodash')
const { argv } = require('yargs')

const devLoginMiddleware = LoginSSO.getDevLoginMiddleware(path.join(__dirname, '../.sso-config'))
const defaultSettings = require('./defaults')

// 本地开发模式：将使用本地mock json 数据
const isLocal = _.get(argv, 'env') === 'dev-local'

// 测试环境配置
let proxy = {
    '/api/*': {
        // target: 'http://172.16.102.181:8080/', // 测试环境(秋霞)
        target: 'http://172.16.103.37:8081/', // 测试环境
        // target: 'http://172.16.140.50:6083/', // 测试环境
        changeOrigin: true,
        onProxyReq(proxyReq, req) {
            console.info(`测试请求地址：${proxy['/api/*'].target}${req.originalUrl}`)
        },
    },
}

// 本地环境配置
if (isLocal) {
    proxy = {
        '/api/': {
            target: `http://127.0.0.1:${defaultSettings.port}`,
            pathRewrite(paths, req) {
                console.info(`本地请求地址：${req.originalUrl}`)
                return `${paths.replace(/^\/api/, '/testdata/')}.json`
            },
            changeOrigin: true,
            onProxyReq(proxyReq, req, res) {
                proxyReq.method = 'GET'
                proxyReq.setHeader('Access-Control-Allow-Origin', true)
            },
        },
    }
}

module.exports = {
    devServer: {
        open: true,
        contentBase: ['./src/', './dist/'],
        historyApiFallback: true,
        // hot: true,
        host: '0.0.0.0',
        port: defaultSettings.port,
        useLocalIp: true,
        disableHostCheck: true,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
        overlay: true,
        before(app) {
            // app.get('/assets/dll.vendor.js', (req, res) => {
            //     res.send(fs.readFileSync(path.join(__dirname, '../dist/assets/dll.vendor.js'), 'utf8'))
            // })
            app.get('/index.html', (req, res) => {
                res.redirect('/')
            })
            app.use(devLoginMiddleware)
        },
        proxy,
    },
    module: {},
    resolve: {
        enforceExtension: false,
        extensions: ['.js', '.jsx'],
        alias: {
            $common: path.resolve(__dirname, '../src/common/'),
            $components: path.resolve(__dirname, '../src/components/'),
            $constants: path.resolve(__dirname, '../src/constants/'),
            $containers: path.resolve(__dirname, '../src/containers/'),
            $reducers: path.resolve(__dirname, '../src/reducers/'),
            $sagas: path.resolve(__dirname, '../src/sagas/'),
            $images: path.resolve(__dirname, '../src/images/'),
            $styles: path.resolve(__dirname, '../src/styles/'),
        },
    },
}
