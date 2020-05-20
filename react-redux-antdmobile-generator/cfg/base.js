const path = require('path')
const fs = require('fs')

const defaultSettings = require('./defaults')

module.exports = {
    devServer: {
        contentBase: './src/',
        historyApiFallback: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
        setup: function(app) {
            app.get('/assets/dll.vendor.js', function(req, res) {
                res.send(fs.readFileSync(path.join(__dirname, '../dist/assets/dll.vendor.js'), 'utf8'));
            });
        },
        proxy: {
            '/mr/*': {
                target: 'http://localhost:' + defaultSettings.port,
                pathRewrite: function(path, req) {
                    return path.replace(/^\/mr/, '/testdata')
                },
                onProxyReq: function(proxyReq, req, res) {
                    proxyReq.method = 'GET';
                    proxyReq.setHeader('Access-Control-Allow-Origin', true);
                },
                bypass: function(req, res, proxyOptions) {
                    var noProxy = [
                    // '/api/course/courseList.action'
                    ];
                    if (noProxy.indexOf(req.url) !== -1) {
                        console.log('Skipping proxy for browser request.');
                        return req.url;
                    }
                },
            },
            // '/mr/*':{
            //     target:'http://10.72.1.96:8080'
            // },
        },
    },
    module: {},
    resolve: {
        enforceExtension: false,
        extensions: [ '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },
}
