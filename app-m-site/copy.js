var copyfiles = require('copyfiles');

//拷贝图片到根目录dist目录下，能够递归拷贝
copyfiles(['./src/images/**', './dist'], 1, () => {console.log('图片已拷贝到dist目录！')});
//antd字体拷贝到dist目录下，递归烤呗
copyfiles(['./src/styles/antd_iconfont/**', './dist'], 2, () => {console.log('ant字体文件已经拷贝到dist目录！')});
// 静态js脚本
copyfiles(['./src/scripts/**', './dist'], 1, () => { console.log('静态脚本已拷贝到dist目录！') })