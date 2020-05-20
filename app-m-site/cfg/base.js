'use strict';
let path = require('path');
let defaultSettings = require('./defaults');
let webpack = require('webpack');
const pxtorem = require('postcss-pxtorem');

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');
// let additionalPaths = [ path.join(npmBase, 'react-bootstrap') ];
let additionalPaths = [];

let proxyUrl = ''
// proxyUrl = 'http://172.16.109.133:8085' // 别删 防lint

// proxyUrl = 'http://172.16.109.133:8084'
// proxyUrl = 'http://172.16.59.159:8080'
proxyUrl = 'http://172.16.109.133:8086' // 谢雨辰

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
    additionalPaths: additionalPaths,
    port: defaultSettings.port,
    debug: true,
    devtool: 'eval',
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].js',
        publicPath: `.${defaultSettings.publicPath}`
    },
    devServer: {
        contentBase: './src/',
        historyApiFallback: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
        proxy: {
            '/community-luntan-war/*': {
                target: proxyCfg.target,
                pathRewrite: function (path, req) {
                    let reqPath = path
                    if (!proxyUrl) {
                        reqPath = `${path.replace(/^\/community-luntan-war/, '/testdata')}`.replace('.action', '')
                    }
                    return reqPath
                },
                onProxyReq: function (proxyReq, req, res) {
                    // proxyReq.method = 'POST';
                    proxyReq.method = proxyCfg.method;
                    proxyReq.setHeader('Access-Control-Allow-Origin', true);
                },
                bypass: function (req, res, proxyOptions) {
                    var noProxy = [
                        // '/api/course/courseList.action'
                    ];
                    if (noProxy.indexOf(req.url) !== -1) {
                        console.log('Skipping proxy for browser request.');
                        return req.url;
                    }
                }
            },
            '/community-sv-war/*': {
                // target: 'http://localhost:' + defaultSettings.port,
                target: proxyCfg.target,
                pathRewrite: function (path, req) {
                    // return path.replace(/^\/community-luntan-war/, '/community-pc-war')
                    // return `${path.replace(/^\/community-sv-war/, '/testdata/community-sv-war/')}.json`;
                    let reqPath = path
                    if (!proxyUrl) {
                        reqPath = `${path.replace(/^\/community-sv-war/, '/testdata/')}.json`;
                    }
                    return reqPath
                },
                onProxyReq: function (proxyReq, req, res) {
                    // proxyReq.method = 'POST';
                    // proxyReq.method = 'GET';
                    proxyReq.method = proxyCfg.method;
                    proxyReq.setHeader('Access-Control-Allow-Origin', true);
                },
                bypass: function (req, res, proxyOptions) {
                    var noProxy = [
                        // '/api/course/courseList.action'
                    ];
                    if (noProxy.indexOf(req.url) !== -1) {
                        console.log('Skipping proxy for browser request.');
                        return req.url;
                    }
                }
            }
            // '/mr/*': {
            //   target: 'http://172.16.102.238:8081/'
            // }
        }
    },
    resolve: {
        modulesDirectories: ['node_modules', path.join(__dirname, '../node_modules')],
        extensions: ['', '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            actions: `${defaultSettings.srcPath}/actions/`,
            components: `${defaultSettings.srcPath}/components/`,
            Components: `${defaultSettings.srcPath}/components/`,
            sources: `${defaultSettings.srcPath}/sources/`,
            stores: `${defaultSettings.srcPath}/stores/`,
            styles: `${defaultSettings.srcPath}/styles/`,
            Styles: `${defaultSettings.srcPath}/styles/`,
            config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
            Constants: `${defaultSettings.srcPath}/constants/`,
            Images: `${defaultSettings.srcPath}/images/`,
            Common: `${defaultSettings.srcPath}/common/`,
            Containers: `${defaultSettings.srcPath}/containers/`,
        }
    },
    module: {},
    postcss: [
        pxtorem({
            rootValue: 75,
            propWhiteList: [],
            selectorBlackList: [/^html$/, /^\.github-/, /^\.gh-/],
        })
    ]
};
