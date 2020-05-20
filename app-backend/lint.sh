#!/bin/sh
# Author: Yanyu
# Description: 
# Date: 2018/04/26
# 
echo "======> run FE's lint procedure start <======"
set -e
source /etc/profile
startTime=`date "+%s"`
npm config set registry http://172.16.116.19:7001/
chmod -R 777 ./
rm -fr ./node_modules
yarn install
npm run eslintdiff $1
endTime=`date "+%s"` 
cost=$[$endTime-$startTime]
echo " ------------------------------------------------------------------------"
echo "  FE's LINT SUCCESS"
echo " ------------------------------------------------------------------------"
echo "  Total time: ${cost}s"
echo "  Finished at: `date '+%Y-%m-%d %H:%M:%S'`"
echo " ------------------------------------------------------------------------"
echo "======> run FE's lint procedure end <======"
