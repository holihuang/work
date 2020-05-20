const fs = require('fs-extra')

// 拷贝图片到根目录dist目录下，能够递归拷贝
fs.copy('./src/images', './dist/images')
    .then(() => {
        console.log('图片已拷贝到dist目录！')
    })
    .then(() => fs.copy('./src/styles/iconfont', './dist/iconfont'))
    .then(() => {
        console.log('iconfont已拷贝到dist目录！')
    })
