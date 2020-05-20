/**
 * Created by duanxiaohui on 2018/6/20.
 */
var spawn = require('cross-spawn')

var run = (task, avgs, configs) => {
    if (!task || task === '') {
        process.exit(1)
    }
    var taskStr = task + ' ' + avgs.join(' ')

    var result = spawn.sync(task, avgs, configs)

    if (result.error) {
        console.log(result.error)
        process.exit(1)
    }
    if (result.status === 1) {
        process.exit(1)
    }

    console.log('run success');
}

module.exports = run;