#!/bin/sh
# Description: 
#   push with codeviewer
# 

# echo "git push origin HEAD:refs/for/$(git rev-parse --abbrev-ref HEAD)%r="$1"@sunlands.com"
# if [ ! -n "$1" ] ;then
#     git push origin HEAD:refs/for/$(git rev-parse --abbrev-ref HEAD)%r=gushouchuang@sunlands.com
# else
#     git push origin HEAD:refs/for/$(git rev-parse --abbrev-ref HEAD)%r=$1@sunlands.com
# fi
git push origin HEAD:refs/for/$(git rev-parse --abbrev-ref HEAD)%\
r=gushouchuang@sunlands.com,\
r=huanghaolei@sunlands.com,\
r=litingwei@sunlands.com,\
r=jiajunwei@sunlands.com,\
r=fengxiaoran@sunlands.com,\
r=humaoying@sunlands.com,\
r=zhangpengyu@sunlands.com

# r=huangyiting@sunlands.com,\