// 'use strict'
const path = require('path')
const fs = require('fs')
const LoginSSO = require('@sunl-fe/login-sso')
const sfeSt = require('@sunl-fe/sfe-st')

const defaultSettings = require('./defaults')
// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');

let proxyUrl = ''
// proxyUrl = 'http://172.16.109.133:8085' // 别删 防lint

// proxyUrl = 'http://172.16.102.200:8081' // 注释即可切换proxy环境 http
// proxyUrl = 'http://172.16.102.127:8080'
// proxyUrl = 'http://172.16.116.136:7080'
// proxyUrl = 'http://172.16.102.200:8081'
// proxyUrl = 'http://172.16.102.127:8080'
// proxyUrl = 'http://172.16.102.200:8081'
// proxyUrl = 'http://172.16.102.200:8080'
// proxyUrl = 'http://172.16.117.225:7091'// 测试环境
// proxyUrl = 'http://172.16.117.2:7121'
// proxyUrl = 'http://172.16.109.233:8082'
// proxyUrl = 'http://172.16.140.50:7091'
// proxyUrl = 'http://172.16.108.37:8080' // 张晓萌
// proxyUrl = 'http://172.16.117.225:7080' // 测试环境
// proxyUrl = 'http://172.16.102.24:8081' // 张晓萌0
// proxyUrl = 'http://172.16.108.34:8080' // jiangfangjie
// proxyUrl = 'http://172.16.117.2:7180' // 谢雨辰
proxyUrl = 'http://172.16.57.177:8180' // 文龙
// proxyUrl = 'http://172.16.100.203:7091' // 新测试环境

// 目前测试环境仅此三套
const testProxyUrlReg = /^http:\/\/172.16.(117.2:7080|100.203:7091|117.225:(7080|7091)|140.42:7080)/

let proxyCfg = {
    target: `http://localhost:${defaultSettings.port}`,
    method: 'GET',
    path: '/testdata',
}

if (proxyUrl) {
    proxyCfg = {
        target: proxyUrl,
        method: 'POST',
        path: '/community-sv-war',
    }
}

module.exports = {
    stats: {
        assets: false,
        builtAt: true,
        cached: true,
    },
    devtool: 'eval',
    devServer: {
        contentBase: './src/',
        historyApiFallback: true,
        open: true,
        openPage: 'index.html',
        overlay: true,
        useLocalIp: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
        before: app => {
            const devLoginMiddleware = LoginSSO.getDevLoginMiddleware(path.join(__dirname, '../.sso-config'))
            app.use(devLoginMiddleware)

            app.get('/assets/dll.vendor.js', (req, res) => {
                res.send(fs.readFileSync(path.join(__dirname, '../dist/assets/dll.vendor.js'), 'utf8'))
            })

            sfeSt.server.createServer({
                app, // app为必填参数
                JsonDTO: { // dataservice的初始化字段
                    flag: 'rs',
                    message: 'rsdesp',
                    data: 'resultMessage',
                },
                // successFlag: 0, // 默认为1
                needCreateMock: '.action', // 控制tpl => mock json脚本是否执行，默认为true
                mockDir: '../../../../src/testdata', // 原src/testdata路径
                port: '4199',
                // wsPath: '/sfe-st/validate', // 浏览器端发起的ws服务名
                preparePath: filePath => filePath.replace('.action', ''), // 允许对ajax的url统一处理
                moduleList: ['community-manager-war'], // 期望校验的后端服务模块名
                // passList: [], // 校验豁免列表
            })
        },
        proxy: {
            '/community-manager-war/*': {
                target: proxyCfg.target,
                ws: true,
                pathRewrite: (rpath, req) => {
                    let rstUrl = ''
                    if (proxyCfg.path === '/testdata') {
                        // 本地暂时先全走.action 包括知识库相关
                        rstUrl = rpath.replace('/community-manager-war', '/testdata/community-manager-war').replace('.action', '')
                        return `${rstUrl}.action`
                    } else if (testProxyUrlReg.test(proxyCfg.target)) {
                        rstUrl = rpath
                    } else {
                        rstUrl = rpath.replace(/^\/community-manager-war/, proxyCfg.path).replace('.action', '')
                    }

                    return rstUrl
                },
                onProxyReq: (proxyReq, req, res) => {
                    proxyReq.method = proxyCfg.method
                    proxyReq.setHeader('Access-Control-Allow-Origin', true)
                },
                bypass: (req, res, proxyOptions) => {
                    const noProxy = [
                        // '/api/course/courseList.action'
                    ]
                    if (noProxy.indexOf(req.url) !== -1) {
                        console.log('Skipping proxy for browser request.')
                        return req.url
                    }

                    return null
                },
            },
        },
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            components: `${defaultSettings.srcPath}/components/`, // Backbone的common组件目录
            datepicker: `${defaultSettings.srcPath}/lib/datepicker`,
            styles: `${defaultSettings.srcPath}/styles/`,
            dataservice: '@sunl-fe/dataservice',
            tpl2: '@sunl-fe/sfe-tpl2',
            getJSON: `${defaultSettings.srcPath}/common/getJSON`,
            src: `${defaultSettings.srcPath}`,
            common: `${defaultSettings.srcPath}/common/`,
        },
    },
    module: {},
}
