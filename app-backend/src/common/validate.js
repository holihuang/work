/*
 * @file 参数校验
 * @author hualuyao
 */

import {common} from './common';
import moment from 'moment';

var validate = {
    //每日活动一句话 新增
    addTodayMotto: function(params) {
        var validateInfo = {
            'bannerImage': '请上传图片！',
            'position': '请填写活动位置编号',
            'startTime': '请填写开始时间'
        }
        //跳转地址校验
        if (params.linkType || params.bannerLink) {

            switch (params.linkType) {
                case "1":
                    if (!/^\+?[1-9][0-9]*$/.test(params.bannerLink)) {
                        alert('跳转地址请输入帖子id');
                        return false;
                    }
                    break;
                case "2":
                    if (!/^\+?[1-9][0-9]*$/.test(params.bannerLink)) {
                        alert('跳转地址请输入版面id');
                        return false;
                    }
                    break;
                case "3":
                    //通过form表单拿到的数据，url已被编码，此处校验需要解码
                    if (!common.testUrl(decodeURIComponent(params.bannerLink))) {
                        alert('请输入合法url');
                        return false;
                    }
                    break;
                default:
                    break;
            }
        }

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        return true;
    },

    //更新每日活动&一句话
    updateTodayMotto: function(params) {
        var validateInfo = {
            'bannerImage': '请上传图片',
        }

        //跳转地址校验
        if (params.linkType || params.bannerLink) {

            switch (params.linkType) {
                case "1":
                    if (!/^\+?[1-9][0-9]*$/.test(params.bannerLink)) {
                        alert('跳转地址请输入帖子id');
                        return false;
                    }
                    break;
                case "2":
                    if (!/^\+?[1-9][0-9]*$/.test(params.bannerLink)) {
                        alert('跳转地址请输入版面id');
                        return false;
                    }
                    break;
                case "3":
                    //通过form表单拿到的数据，url已被编码，此处校验需要解码
                    if (!common.testUrl(decodeURIComponent(params.bannerLink))) {
                        alert('请输入合法url');
                        return false;
                    }
                    break;
                default:
                    break;
            }
        }

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        return true;
    },

    //新增版块
    insertBrandVIP: function(params) {
        var validateInfo = {
            'courseId': '请填写课程表ID',
            'moduleName': '请填写模块名称',
            'moduleQuality': '请填写模块尺寸',
            'postMasterId': '请填写主贴子ID',
            'imageSrc': '请上传图片',
            'position': '请填写排序位置'
        };

        for (var i = 0, len = params.length; i < len; i++) {
            for (var k in validateInfo) {
                if (!params[i][k]) {
                    alert((i+1) + validateInfo[k]);
                    return false;
                }
            }
        }

        return true;
    },

    //新增课程产品包
    insertCoursePackage: function(params) {
        var validateInfo = {
            'courseId': '请填写课程板块ID',
            'packageName': '请填写产品包名称',
            'packageLink': '请填写产品包链接',
            'packageIcon': '请上传图片',
            'price': '请填写课程售价',
            'description': '请选择课程标签'
        };

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        return true;
    },

    //免费课开课配置
    configureFreeClass: function(params) {
        var validateInfo = {
            'lessonName': '请填写课程名称',
            'lessonDate': '请选择上课日期',
            'beginTime': '请选择上课开始时间',
            'endTime': '请选择上课结束时间',
            'imgUrl': '请上传课程图片',
            'liveWebcastid': '请填写课程直播间ID',
            'friendsShareIcon': '请上传微信分享配图',
            'friendsShareSubject': '请填写微信分享标题',
            'shareUrl': '请填写分享url'
        };

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        // //直播间id必须为数字
        // let {postMasterId, liveWebcastid} = params;
        // if (isNaN(postMasterId)) {
        //     alert('课程帖id请填写数字！');
        //     return false;
        // }
        // if (isNaN(liveWebcastid)) {
        //     alert('课程直播间id请填写数字！');
        //     return false;
        // }

        return true;
    },

    updateFreeClass: function(params) {
        var validateInfo = {
            'lessonName': '请填写课程名称',
            'lessonDate': '请选择上课日期',
            'beginTime': '请选择上课开始时间',
            'endTime': '请选择上课结束时间',
            'imgUrl': '请上传课程图片',
            'liveWebcastid': '请填写课程直播间ID',
            'friendsShareIcon': '请上传微信分享配图',
            'friendsShareSubject': '请填写微信分享标题',
            'shareUrl': '请填写分享url'
        };

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        // //直播间id必须为数字
        // let {postMasterId, liveWebcastid} = params;
        // if (isNaN(postMasterId)) {
        //     alert('课程帖id请填写数字！');
        //     return false;
        // }
        // if (isNaN(liveWebcastid)) {
        //     alert('课程直播间id请填写数字！');
        //     return false;
        // }

        return true;
    },

    //新建一级版块
    createNewParentAlbum: function(params) {
        var validateInfo = {
            'albumName': '请填写版面名称',
            // 'albumDesp': '请填写版面描述',
            'albumIsInner': '请选择版面是否隐藏',
            'albumIcon': '请上传版面图片',
            'agencyIcon': '请上传学院图片'
        };

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        return true;
    },

    //新建二级版块
    createNewChildAlbum: function(params) {
        var validateInfo = {
            'albumParentId': '请填写父版面ID',
            'albumName': '请填写版块名称',
            // 'albumDesp': '请填写版面描述',
            'albumIsInner': '请选择版面是否隐藏',
            'albumIcon': '请上传版面图片',
            'agencyName': '请输入机构号名称',
            'agencyIcon': '请上传专业图片'
        }

        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        return true;
    },

    //新建pc社区广告
    addPcSocialAd: function(params) {
        var {startTime, endTime, adLink, adType} = params;
        if (adType == 1) {
            adLink = decodeURIComponent(adLink);
            if (!common.testUrl(adLink)) {
                alert('请填写完整的url，以http或https或ftp开头');
                return false;
            }
        } else if (adType == 2) {//首页弹窗广告
            var validateInfo = {
                'startTime': '请输入开始时间',
                'endTime': '请输入结束时间',
                'adImage': '请上传图片'
            }
            for (var k in validateInfo) {
                if (!params[k]) {
                    alert(validateInfo[k]);
                    return false;
                }
            }
        }

        return true;
    },

    //首页热帖-新增|更新
    addPostsPic: function(params) {
      var {beginTime, endTime, postMasterId, pageNo, ranking} = params;
      var validateInfo = {
        'beginTime' : '请输入开始时间',
        'endTime' : '请输入结束时间',
        'pageNo' : '请输入帖子位置页码',
        'ranking' : '请输入帖子位置位数'
      }
      for(var k in validateInfo) {
        if(!params[k]) {
          alert(validateInfo[k]);
          return false;
        }
      }
      return true;
    },


    //首页热帖-新增屏蔽
    addShield: function(params) {
        const { postMasterId, contentType } = params;
        let emptyTipText = "请输入帖子ID！";
        if(contentType == 1) {
            emptyTipText = "请输入帖子ID！";
        } else if(contentType == 5) {
            emptyTipText = "请输入问题ID！";
        }
      if(!postMasterId) {
        alert(emptyTipText);
        return false;
      } else {
        if(isNaN(postMasterId)) {
          alert("请输入数字！");
          return false;
        }
      }
      return true;
    },

    //校验话题名称存在的情况下不能为空
    isTopicNameNotEmpty: function(params) {
        if(params.isShowTopicName) {
            if(!params.topicIdList.length) {
                alert("话题名称不能为空！");
                return false;
            }
        }
        return true;
    },

    //校验结束日期不小于开始日期
    isEndBiggerThanStart: function(params) {
        var sTbefore = params.beginTime.replace(/%3A/ig, ':');
        var eTbefore = params.endTime.replace(/%3A/ig, ':');
        var sT = moment(sTbefore);
        var eT = moment(eTbefore);

        if(sT && eT) {
            if((eT - sT)<0) {
                alert('结束时间不能小于开始时间');
                return false;
            }
        }
        return true;
    },

    insertAnnouncement: function(params) {
        var validateInfo = {
            'startTime': '请输入开始时间',
            'endTime': '请输入结束时间',
            'linkAddress': '请填写跳转URL',
            'annSubject': '请填写活动标题',
            'annDescription': '请填写活动介绍'
        }
        //必填校验
        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        //合法校验
        let {startTime, endTime, annSubject, annDescription, linkAddress} = params;
        if (moment(startTime) > moment(endTime)) {
            alert('开始时间不能大于结束时间！');
            return false;
        }
        if (!common.testUrl(decodeURIComponent(linkAddress))) {
            alert('请填写完整合法的url，以http或https或ftp开头');
            return false;
        }
        if (decodeURIComponent(annSubject).length > 8) {
            alert('活动标题不能超过8个字！');
            return false;
        }
        if (decodeURIComponent(annDescription).length > 200) {
            alert('活动介绍不能超过200字！');
            return false;
        }

        return true;
    },

    updateAnnouncement: function(params) {
        var validateInfo = {
            'annSubject': '请填写活动标题',
            'annDescription': '请填写活动介绍'
        }

        //必填校验
        for (var k in validateInfo) {
            if (!params[k]) {
                alert(validateInfo[k]);
                return false;
            }
        }

        let {annSubject, annDescription} = params;

        //合法校验
        if (decodeURIComponent(annSubject).length > 8) {
            alert('活动标题不能超过8个字！');
            return false;
        }
        if (decodeURIComponent(annDescription).length > 200) {
            alert('活动介绍不能超过200字！');
            return false;
        }

        return true;
    },

    /*====================精选话题=============================*/
    addOrUpdateSelectedTopics: function(params) {
        var validateInfo = {
            'topicTitle': '请填写话题名称！',
            'topicBrief': '请填写话题简介！',
            'mediaLinks':'请上传图片！',
            'topicWeight': '请填写话题权重！'
        };
        /*
        for(var k in validateInfo) {
            if(!decodeURIComponent(params[k])) {
                alert(validateInfo[k]);
                return false;
            }
            
        }*/
        let topicTitleVal = decodeURIComponent(params.topicTitle);
        let titleSizeNum = topicTitleVal.length;
        if(titleSizeNum > 20) {
            alert("话题名称支持英文字母、汉字组合，20个字符以内！");
            return false;
        } else {
            if(!(this.checkPound(topicTitleVal))) {
                alert("#是自动生成的，不可以再添加#哟～");
                return false;
            }
        }

        let topicBriefVal = decodeURIComponent(params.topicBrief);
        let briefSizeNum = topicBriefVal.length;
        if(briefSizeNum > 100) {
            alert("话题简介支持英文字母、汉字组合，100个字符以内！");
            return false;
        }
        
        let topicWeightVal = decodeURIComponent(params.topicWeight);
        if(typeof +topicWeightVal == 'number') {
            if(+topicWeightVal < 0 || +topicWeightVal > 100) {
                alert("请输入0-100以内的阿拉伯数字！");
                return false;
            } else {
                return true;
            }
        } 

        return true;
    },
    /*============================校验中英文字符数======================================*/
    countTotalSize: function(str) {
        if(str) {
            let l = str.length;
            let sizeNum = 0;
            for(let i=0; i<l; i++) {
                if(str.charCodeAt(i)>=0 && str.charCodeAt(i)<=128) {
                    sizeNum++;
                } else {
                    sizeNum += 2;
                }
            }
            return sizeNum;
        }
    },
    /*=====================校验字符串中的#(包括圆角＃或半角的#)===========================*/
    checkPound: function(str) {
        let l = str.length;
        for(let i = 0; i < l; i++){
            if (str.charAt(i) == "#" || str.charAt(i) == "＃") {
                return false;
            };    
        }
        return true;
    }, 

    /*
    ** @params {String}
    ** return {Boolean}
    */
    isUrlPrefix(str) {
        const reg = /^[hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\//;
        if(!reg.test(str)) {
            alert("请输入合法的跳转链接");
            return false;
        }
        return true;    
    }
    
}
export {validate}