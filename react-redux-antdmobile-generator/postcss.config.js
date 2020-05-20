const pxtorem = require('postcss-pxtorem')

module.exports = {
    plugins: [
        pxtorem({
            rootValue: 75,
            propWhiteList: [],
            selectorBlackList: [/^html$/, /^\.ant-/, /^\.github-/, /^\.gh-/],
        })
    ]
};