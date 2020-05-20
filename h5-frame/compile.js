const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const fse = require('fs-extra')

const SOURCE = 'source'
const DEST = 'lib'

const source = path.resolve(SOURCE)
const dest = path.resolve(DEST)

function compile(dir = source) {
    // fse.removeSync(dest)
    fs.readdir(dir, (err, files) => {
        if(err) console.error(err)
        for(let i = 0; i < files.length; i++) {
            const item = files[i]
            fs.stat(path.resolve(dir, item), (error, stats) => {
                if(error) console.error(error)
                const sourcePath = path.resolve(dir, item)
                const destPath = path.resolve(dir.replace(SOURCE, DEST), item)
                if(stats.isFile()) {
                    const reg = /\.js$/
                    if (reg.test(item)) {
                        // 编译文件
                        spawn.sync('npx', ['babel', sourcePath, '-o', destPath])
                        console.log(`${sourcePath} 编译完成！`)
                    } else {
                        // 拷贝文件
                        fse.copySync(sourcePath, destPath)
                        console.log(`${sourcePath} 拷贝完成！`)
                    }
                }
                if(stats.isDirectory()) {
                    compile(sourcePath)
                }
            })
        }
    })
}

compile()
