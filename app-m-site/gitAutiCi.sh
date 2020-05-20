#!/bin/bash
# Description:
#   push with codeviewer
#

if [ ! -n "$1" ]
then
    echo "缺失commit日志信息，请补充。"
else
    echo "commit日志" $1
    git add .
    git commit -m "$1"
    last_commit_id=$(git log|grep commit|awk '{print $2}'|head -1)
    echo last_commit_id=$last_commit_id
    # node commited-git-files.js $last_commit_id
    # if [ $? -eq 0 ]; then
    # echo "elint succeed"
    current_branch_remote=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
    branch_remote=${current_branch_remote#*/}
    echo "branch_remote $branch_remote"
    git pull
    git push origin HEAD:refs/for/$branch_remote%r=gushouchuang@sunlands.com,r=huanghaolei@sunlands.com,r=litingwei@sunlands.com,r=jiajunwei@sunlands.com,r=fengxiaoran@sunlands.com,r=zhangpengyu@sunlands.com

    # 浏览器打开gerrit  
    tbd_delete_git_gushouchuang='tbd_delete_git_gushouchuang.js'
    rm -rf $tbd_delete_git_gushouchuang
    touch $tbd_delete_git_gushouchuang

    echo "var c = require('child_process')" >> $tbd_delete_git_gushouchuang
    echo "c.exec('start http://172.16.117.224:800/#/dashboard/self')" >> $tbd_delete_git_gushouchuang
    node $tbd_delete_git_gushouchuang
    rm -rf $tbd_delete_git_gushouchuang
    # else
    #     echo "elint failed"
    #     git reset --soft HEAD^
    #     exit 1
    # fi
fi