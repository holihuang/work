#!/bin/sh
# Author: Yanyu
# Description:
#   a front-end build script for seajs based project, use nodejs enviroment and grunt tool to
#   transport cmd modules, concat, minify, uglify js/tpl/css... resources.
# Date: 2016/03/02
#
echo "======> run FE's build procedure start <======"
source /etc/profile
startTime=`date "+%s"`
npm config set registry http://172.16.116.19:7001/
chmod -R 777 ./
rm -fr ./node_modules
yarn install

node task.js $1

#编译完成，所有文件已放到项目的dist目录下，删除在过程中可能引入的.git隐藏文件夹
find dist -type d -name ".git" -exec rm -r {} \;

rc=$?; if [[ $rc == 1 ]]; then exit $rc; fi
rm -fr ./node_modules
endTime=`date "+%s"`
cost=$[$endTime-$startTime]
echo " ------------------------------------------------------------------------"
echo "  FE's BUILD SUCCESS"
echo " ------------------------------------------------------------------------"
echo "  Total time: ${cost}s"
echo "  Finished at: `date '+%Y-%m-%d %H:%M:%S'`"
echo " ------------------------------------------------------------------------"
echo "======> run FE's build procedure end <======"
