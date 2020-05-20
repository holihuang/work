var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var run = require('./run');

const args = process.argv.slice(2);
const env = args[0];

var CONFIG_PATH;
switch (env) {
    case 'dev':
        //这里的配置文件路径依据自己项目的实际情况来即可
        CONFIG_PATH = path.join(__dirname, 'cfg/dev');
        break;
    case 'test':
        CONFIG_PATH = path.join(__dirname, 'cfg/test');
        break;
    case 'preprod':
        CONFIG_PATH = path.join(__dirname, 'cfg/preprod');
        break;
    case 'prod':
        CONFIG_PATH = path.join(__dirname, 'cfg/dist');
        break;
    case 'production':
        CONFIG_PATH = path.join(__dirname, 'cfg/dist');
        break;
    default:
        CONFIG_PATH = path.join(__dirname, 'cfg/dist');
        break;
}

//这里执行的是package.json中配置的命令；根据项目需要配置
run('npm', ['run', 'copy'], {stdio: 'inherit'});

var webpackBuild = function(path) {
    var config  = require(path)
    return new Promise(function(resolve, reject) {
        var date = new Date();
        var errorInfo;
        console.log('webpack start to build ' + path + ' @ ' + date)
        webpack(config, function(err, stats) {
            if (err) {
                console.log(err);
                errorInfo = date + ':\n' + err + '\n';
                fs.appendFileSync('fe.log', errorInfo);
                reject()
                process.exit(1);
            }
            var jsonStats = stats.toJson();
            if(jsonStats.errors.length > 0) {
                console.log(jsonStats.errors);
                errorInfo = date + ':\n' + jsonStats.errors + '\n';
                fs.appendFileSync('fe.log', errorInfo);
                reject()
                process.exit(1);
            }
            console.log('webpack finish build ' + path + ' @ ' + date)
            resolve()
        })
    })
}
// webpack builddll && dist
const dll = path.join(__dirname, 'cfg/dll.js')
webpackBuild(dll)
    .then(() => {
        webpackBuild(CONFIG_PATH)
    })
    .then(() => {
        console.log('webpack compile success')
    })
    .catch(() => {
        process.exit(1)
    })

