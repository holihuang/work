let fs = require('fs'); 
let path = require('path');
let webpack = require('webpack');

let run = require('./run');

const args = process.argv.slice(2);
const env = args[0];

let CONFIG_PATH;
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
    default:
        CONFIG_PATH = path.join(__dirname, 'cfg/dist');
        break;
}


let config = require(CONFIG_PATH);

//这里执行的是package.json中配置的命令；根据项目需要配置
run('npm', ['run', 'copy'], {stdio: 'inherit'}); 

let date = new Date();
let errorInfo;
//webpack
webpack(config, function(err, stats) {
    if (err) {
        console.log(err);
        errorInfo = date + ':\n' + err + '\n';
        fs.appendFileSync('fe.log', errorInfo);
        process.exit(1);
    }
    var jsonStats = stats.toJson();
    if(jsonStats.errors.length > 0) {
        console.log(jsonStats.errors);
        errorInfo = date + ':\n' + jsonStats.errors + '\n';
        fs.appendFileSync('fe.log', errorInfo);
        process.exit(1);
    }
    console.log('compile success');
})