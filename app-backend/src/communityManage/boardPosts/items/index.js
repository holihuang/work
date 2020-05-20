import {service} from '../../../common/service';
import {Dialog} from '../../../components/dialog/index';
import {envCfg} from '../../../common/envCfg';
import {common} from '../../../common/common';
import {TransferDialog} from '../dialog/transfer/index';
import {HidePostDialog} from '../dialog/hidePost/index';
import {TopicSetter} from '../dialog/topicSetter/index';

import _ from 'underscore';

var tpl = require('./tpl.html');
var logTpl = require('../dialogTpl/logTpl.html');
var sortTpl = require('../dialogTpl/sortTpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        userRole: window.userInfo.userRole,
        operateType: {
            'HIDE': '屏蔽',
            'RECOVER_HIDE': '取消屏蔽',
            'DELETE': '删除',
            'RECOVER_DELETE': '取消删除',
            'GLOBAL': '设置全局',
            'RECOVER_GLOBAL': '取消全局',
            'STAR': '加精',
            'RECOVER_STAR': '取消加精',
            'TOP': '置顶',
            'RECOVER_TOP': '取消置顶',
            'TYPE': '编辑分类',
            'RECOVER_TYPE': '取消所有分类',
            'GLOBAL_TOP': '全局置顶',
            'RECOVER_GLOBAL_TOP': '取消全局置顶',
            'TRANSFER': '迁移',
            'SET_TOPIC': '设置话题',
            'REMOVE_TOPIC': '移除话题',
            AUDIT_PASS: '审核通过'
        },
        masterTypes: ['作业', '答疑', '通知', '精品', '签到']
    }
});


var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        var {pageSize, pageNo, isHide, deleteFlag, albumParentId, albumChildId, postSubject, resultList, reqTime, showPostPurpose, showThumbupCommentsNumber,
            //新加搜索条件
            postState, startTime, endTime, userId, nickname, mobile, topicName, content, postMasterId, sensitiveWord, firstReason, isTopic, postType, ...bsParams} = options;

        this.model.set({
            resultList,
            albumParentId,
            albumChildId,
            postSubject,
            isHide,
            deleteFlag,
            pageSize,
            pageNo,
            reqTime,
            showPostPurpose,
            //新加搜索条件
            postState,
            startTime,
            endTime,
            userId,
            nickname,
            mobile,
            postMasterId,
            sensitiveWord,
            firstReason,
            //是否显示点赞数和评论数
            showThumbupCommentsNumber,
            postType,
            isTopic,
            topicName,
            content,
            ...bsParams
        });
    },

    events: {
        'click .cancel-post-top': 'cancelPostTop',   //取消置顶
        'click .post-top': 'postTop',  //置顶
        'click .cancel-post-star': 'cancelPostStar', //取消加精
        'click .post-star': 'postStar', //加精
        'click .post-global': 'postGlobal',  //全局
        'click .cancel-post-global': 'cancelPostGlobal',  //取消全局
        'click .delete-post': 'deletePost',  //删除帖子
        'click .cancel-delete': 'cancelDeletePost',  //恢复帖子,
        'click .hide-post': 'hidePost',  //屏蔽帖子
        'click .cancel-hide': 'cancelHidePost', //恢复屏蔽帖子
        'click .sort': 'sortPost',   //查看帖子分类
        'click .check-purpose': 'checkPurpose',  //查看发帖动机
        'click .checklog': 'getPostOperationLog',  //查看操作日志
        'click .post-global-top': 'postGlobalTop',  //全局置顶
        'click .cancel-post-global-top': 'cancelPostGlobalTop',  //取消全局置顶
        'click .transfer': 'transferPost',  //帖子迁移
        'click .set-topic': 'setTopic' //编辑话题
    },

    /*******************************话题部分*******************************/
    getCheckedItems() { //flag为1 表示设置话题，为2表示移除话题
        let postIdList = [];
        let canBatchOperate = true;
        let {resultList} = this.model.toJSON();
        let topicsObj = {};
        let _topics = '';
        let _topicTypeList = [];
        let _topicIds = [];
        let selectTopics = [];

        this.$el.find('.check-item-ipt').each(function() {
            if ($(this).prop('checked')) {
                let {postMasterId, topics, topicTypeList, topicIds} = resultList[$(this).val()];
                postIdList.push(postMasterId);

                //判断选中帖子的话题是否一致
                (!_topics) && (_topics = topics);
                (!_topicTypeList.length) && (_topicTypeList = topicTypeList);
                (!_topicIds.length) && (_topicIds = topicIds);

                if (_topics != topics) {
                    canBatchOperate = false;
                    return false;
                }
            }
        })

        if (canBatchOperate) {
            _topics = (_topics && _topics.split(';')) || [];
            for (let i = 0, len = _topics.length; i < len; i++) {
                selectTopics.push({
                    topicId: _topicIds[i],
                    topicType: _topicTypeList[i],
                    topicTitle: _topics[i]
                })
            }
        }

        return {postIdList, selectTopics, topicIds: _topicIds, canBatchOperate};
    },

    setTopicService(postIdList, topicIds, selectTopics) {
        new TopicSetter({
            postIdList,
            topicIds,
            selectTopics,
            onSuccess: this.refreshTableData.bind(this)
        });
    },

    //设置话题
    setTopic(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {postMasterId, topicIds, topicTypeList, topics} = resultList[index];
        topics = (topics && topics.split(";")) || [];
        let selectTopics = [];
        for (let i = 0, len = topics.length; i < len; i++) {
            selectTopics.push({
                topicId: topicIds[i],
                topicType: topicTypeList[i],
                topicTitle: topics[i]
            })
        }

        this.setTopicService([postMasterId], topicIds, selectTopics);
    },

    //批量设置话题
    batchSetTopic() {
        let {postIdList, selectTopics, topicIds, canBatchOperate} = this.getCheckedItems();
        if (!canBatchOperate) {
            alert('您所选的帖子中话题不一致，不支持批量操作哟，请分开进行操作~~');
            return false;
        } else {
            if (!postIdList.length) {
                alert('请选择要批量设置话题的帖子');
                return false;
            } else {
                this.setTopicService(postIdList, topicIds, selectTopics);
            }
        }
    },
    /***************************************************************************/

    //置顶
    postTop: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var {albumParentId, albumChildId, postMasterId} = resultList[index];
        this.updatePostTop(1, albumParentId, albumChildId, postMasterId);
    },
    //取消置顶
    cancelPostTop: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var {albumParentId, albumChildId, postMasterId} = resultList[index];
        this.updatePostTop(0, albumParentId, albumChildId, postMasterId);
    },
    //更新置顶信息
    updatePostTop: function(status, albumParentId, albumChildId, postMasterId) {
        var email = window.userInfo.userAccount;
        //由于要限制每个版面下置顶帖的条数，
        //此处传参需提供帖子所在的父版面和子版面id
        var params = {
            postTop: status,
            postMasterId,
            albumChildId,
            albumParentId,
            email
        };

        var that = this;

        service.updatePostMasterTop(params, (response) => {
            if (response.rs) {
                alert('操作成功');
                this.refreshTableData();  //刷新数据
            } else {
                alert(response.rsdesp);
            }
        })
    },

    //加精
    postStar: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        this.updatePostStar(1, [postMasterId]);
    },
    //取消加精
    cancelPostStar: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        this.updatePostStar(0, [postMasterId]);
    },
    //更新加精状态
    updatePostStar: function(status, postMasterIds) { //status为1表示加精，为0表示取消加精
        var email = window.userInfo.userAccount;
        let l = postMasterIds.length;
        let postMasterId;
        if(l == 1) {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        var params = {
            postStar: status,
            postMasterIds,
            postMasterId,
            email
        };

        service.updatePostMasterStar(params, (response) => {
            if (response.rs) {
                alert('操作成功');
                this.refreshTableData();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    //批量加精
    batchStar: function(postMasterIds, flag) {
        let operateFlag;
        if(flag) {
            operateFlag = 1;
        }

        service.updatePostMasterStar({
            postMasterIds,
            operateFlag,
            postStar: 1,
            email: window.userInfo.userAccount
        }, (response) => {
            if (response.rs) {
                alert('操作成功');
                this.refreshTableData();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    postGlobalTop: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        this.updateGlobalTop(1, postMasterId);
    },

    cancelPostGlobalTop: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        this.updateGlobalTop(0, postMasterId);
    },

    //更新全局置顶状态
    updateGlobalTop: function(status, postMasterId) {
        service.updatePostMasterGlobalTop({
            postGlobalTop: status,
            email: window.userInfo.userAccount,
            postMasterId
        }, (response) => {
            if (response.rs) {
                alert('操作成功');
                this.refreshTableData();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    deletePost: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        this.deletePostDialog([postMasterId], 0);
    },

    //删除主贴-批量（单个）共用方法
    deletePostDialog: function(postMasterIds, flag) {
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }

        new HidePostDialog({
            isHide: false,
            showPostPurposeContainer: true,
            title: '删除帖子',
            reqUrl: 'deletePostByUserId',
            onSuccess: this.refreshTableData.bind(this),
            operateFlag,
            postMasterIds,
            postMasterId
        });
    },

    //屏蔽帖子
    hidePost: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;
        /*
        new HidePostDialog({
            isHide: true,
            title: '屏蔽帖子',
            reqUrl: 'updatePostMasterHideState',
            onSuccess: this.refreshTableData.bind(this),
            postMasterId
        });*/
        this.hidePostDialog([postMasterId], 0);
    },
    //屏蔽帖子-弹窗
    hidePostDialog: function(postMasterIds, flag){
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        new HidePostDialog({
            operateFlag,
            showPostPurposeContainer: false,
            isHide: true,
            title: '屏蔽帖子',
            reqUrl: 'updatePostMasterHideState',
            onSuccess: this.refreshTableData.bind(this),
            postMasterIds,
            postMasterId
        });
    },

    cancelDeletePost: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;

        this.batchCancelDeletePost([postMasterId], 0)
    },

    ////批量（单个）恢复删除共用方法
    batchCancelDeletePost: function(postMasterIds, flag) {
        var email = window.userInfo.userAccount;
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        var params = {
            postMasterIds,
            operateFlag,
            postMasterId,
            email
        };

        var that = this;
        if (confirm('确定要恢复该帖子吗？')) {
            common.loading(); //loading动画
            service.recoverPostMasterByManager(params, function(response) {
                if (response.rs) {
                    alert('恢复成功！');
                    that.refreshTableData();
                } else {
                    alert('恢复失败: ' + response.rsdesp);
                }
            })
        }
    },

    //恢复屏蔽的帖子
    cancelHidePost: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;

        this.batchCancelHidePost([postMasterId], 0)
    },
    //批量（单个）恢复屏蔽共用方法
    batchCancelHidePost: function(postMasterIds, flag) {
        var email = window.userInfo.userAccount;
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        var params = {
            isHide: 0,
            operateFlag,
            postMasterIds,
            postMasterId,
            email
        };
        var that = this;
        if (confirm('确定要恢复该帖子吗？')) {
            common.loading(); //loading动画
            service.updatePostMasterHideState(params, function(response) {
                if (response.rs) {
                    alert('恢复成功！');
                    that.refreshTableData();
                } else {
                    alert('恢复失败！' + response.rsdesp);
                }
            })
        }

    },
    //批量屏蔽主帖
    batchRefusePosts: function(postMasterIds, flag) {
        var email = window.userInfo.userAccount;
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        var params = {
            isHide: 1,
            operateFlag,
            postMasterIds,
            postMasterId,
            email,
            auditFlag: true,
        };
        var that = this;
        if (confirm('确定要屏蔽该帖子吗？')) {
            common.loading(); //loading动画
            service.updatePostMasterHideState(params, function(response) {
                if (response.rs) {
                    alert('屏蔽成功！');
                    that.refreshTableData();
                } else {
                    alert('屏蔽失败！' + response.rsdesp);
                }
            })
        }

    },
    //批量通过审核主帖
    batchAgreePosts: function(postMasterIds, flag) {
        var email = window.userInfo.userAccount;
        let operateFlag;
        let postMasterId;
        if(flag) {
            operateFlag = 1;
        } else {
            postMasterId = postMasterIds[0];
            postMasterIds = [];
        }
        var params = {
            isHide: 0,
            operateFlag,
            postMasterIds,
            postMasterId,
            email,
            auditFlag: true,
        };
        var that = this;
        if (confirm('确定要通过该帖子吗？')) {
            common.loading(); //loading动画
            service.updatePostMasterHideState(params, function(response) {
                if (response.rs) {
                    alert('通过成功！');
                    that.refreshTableData();
                } else {
                    alert('通过失败！' + response.rsdesp);
                }
            })
        }

    },
    //查看帖子分类
    sortPost: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList, masterTypes} = this.model.toJSON();
        var {postMasterId, albumParentId, albumChildId} = resultList[index];

        var that = this;

        service.retrieveMasterTypeById({
            postMasterId
        }, (response) => {
            if (response.rs) {
                let resultMessage = response.resultMessage;
                let result = resultMessage && resultMessage.result;  //该帖子分类，以逗号分隔
                let masterTypesObjArr = [];
                for (var i = 0, len = masterTypes.length; i < len; i++) {
                    masterTypesObjArr.push({
                        "type": masterTypes[i],
                        "checked": result.indexOf(masterTypes[i]) === -1 ? '' : 'checked'
                    });
                }

                new Dialog({
                    title: '帖子分类设置',
                    type: 2,
                    content: sortTpl({masterTypesObjArr}),
                    ok: function() {
                        //获取帖子分类的值,字符串形式，以英文逗号分割
                        var masterTypesArr = [],
                            masterTypes;

                        $('input[name="masterTypes"]:checked').each(function() {
                            masterTypesArr.push($(this).val());
                        });

                        masterTypes = masterTypesArr.join(',');
                        if (masterTypes === result) {
                            //说明没有更新该帖子分类
                            //直接关闭窗口
                            this.closeDialog();
                            return;
                        }

                        service.updateMasterType({
                            postMasterId,
                            albumParentId,
                            albumChildId,
                            masterTypes,
                            email: common.getUserInfo().userAccount
                        }, (response) => {
                            if (response.rs) {
                                alert('设置成功!');
                                this.closeDialog();
                                that.refreshTableData();
                            }
                        })
                    }
                })
            }
        })
    },

    //查看发帖动机
    checkPurpose: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var postMasterId = resultList[index].postMasterId;

        service.retrievePostPurpose({
            postMasterId
        }, (response) => {
            if (response.rs) {
                var resultMessage = response.resultMessage;
                var result = resultMessage.result || '无';

                new Dialog({
                    title: '发帖动机',
                    type: 2,
                    content: `<span>${result}</span>`
                });
            } else {
                alert('查询失败' + response.rsdesp);
            }
        })
    },

    //帖子迁移
    transferPost: function(e) {
        let index = +$(e.currentTarget).attr('index');
        //let {resultList} = this.model.toJSON();
        //let  {postMasterId, albumParentId, albumChildId, albumParentName, albumChildName} = resultList[index];
        //this.transferDialog = new TransferDialog({postMasterId, albumParentId, albumChildId, albumParentName, albumChildName, onSuccess: this.refreshTableData.bind(this)});
        this.batchTransferPost([index], 0);
    },

    //批量（单个）迁移操作-共用方法
    batchTransferPost: function(index_options, flag) {
        //console.log(index_options)
        let l = index_options.length;
        let operateFlag;
        if(flag) {
            operateFlag = 1;
        }
        let {resultList} = this.model.toJSON();
        let postsLists = [];
        for(let i=0; i<l; i++) {
            let  {postMasterId, albumParentId, albumChildId, albumParentName, albumChildName} = resultList[index_options[i]];
            postsLists.push({operateFlag, postMasterId, albumParentId, albumChildId, albumParentName, albumChildName});
        }
        this.transferDialog = new TransferDialog({postsLists, onSuccess: this.refreshTableData.bind(this)});
    },


    //查看操作日志
    getPostOperationLog: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList, operateType} = this.model.toJSON();
        var {postMasterId} = resultList[index];

        service.getPostOperationLog({
            postMasterId
        }, (response) => {
            if (response.rs) {
                var resultMessage = response.resultMessage;
                if (resultMessage.length) {
                    resultMessage.forEach((item, index) => {
                        item.typeText = operateType[item.type];
                        item.postPurpose = item.postPurpose || '无';
                        item.showReason = item.type === 'HIDE' && item.firstReason && item.secondReason;
                    })

                    new Dialog({
                        title: '操作日志',
                        type: 2,
                        content: logTpl({resultMessage})
                    });
                } else {
                    alert('暂无操作记录');
                }
            } else {
                alert('查询失败' + response.rsdep);
            }
        })
    },

    refreshTableData() {
        var {
            albumParentId,
            albumChildId,
            postSubject,
            isHide,
            deleteFlag,
            pageSize,
            pageNo,
            reqTime,
            //以下为新增搜索条件
            postState,
            nickname,
            mobile,
            startTime,
            endTime,
            postMasterId,
            sensitiveWord,
            firstReason,
            praiseCountOrder,
            replyCountOrder,
            //是否显示点赞数和评论数
            showThumbupCommentsNumber,
            isTopic,
            userId,
            topicName,
            content,
            ...bsParams
        } = this.model.toJSON();

        let {minPraiseCount, maxPraiseCount, minReplyCount, maxReplyCount} = bsParams;
        //格式化postState为数组形式
        /*
        let postStateTempt = +postState.split(" ")[0];
        let postStateArr = [];
        postStateArr.push(postStateTempt);
        postState = postStateArr;*/

        var params = {
            albumParentId,
            albumChildId,
            postSubject,
            isHide,
            deleteFlag,
            pageSize,
            pageNo,
            reqTime,
            userId,
            //以下为新增搜索条件
            postState,
            minPraiseCount,
            maxPraiseCount,
            minReplyCount,
            maxReplyCount,
            nickname,
            mobile,
            startTime,
            endTime,
            postMasterId,
            sensitiveWord,
            firstReason,
            praiseCountOrder,
            replyCountOrder,
            topicName,
            content,
            showThumbupCommentsNumber,
            isTopic
        }

        service.retrievePostList(params, (response) => {
            if (response.rs) {
                var resultList = response.resultMessage.resultList;
                this.model.set({resultList});
            }
        })
    },

    format(data) {

        //状态 & 帖子url & 操作面板 & index
        var {resultList = [], userRole, showPostPurpose, isHide, deleteFlag, showThumbupCommentsNumber, postType} = data;
        var showSortBtn = false;  //是否可以看到分类按钮，默认为false
        var showTransferBtn = false;  //是否可以看到迁移按钮，默认为false
        var showTopics = false; //是否显示帖子话题项
        var canEditTopic = false;
        let showContentNoPic = false;
        //研发('dev'和学院版主'SCH_BM'可对正常帖帖子进行分类
        if (!isHide && !deleteFlag && (userRole.toLowerCase().indexOf('dev') !== -1 || userRole.toLowerCase().indexOf('sch_bm') !== -1)) {
            showSortBtn = true;

            //研发可对正常帖子进行迁移
            if (userRole.toLowerCase().indexOf('dev') !== -1) {
                showTransferBtn = true;
            }
        }

        if (!isHide && !deleteFlag) {
            //正常帖下显示帖子话题
            showTopics = true;

            //只有研发可以编辑话题
            if (userRole.toLowerCase().indexOf('dev') !== -1) {
                canEditTopic = true;
            }
        }

        //主贴-帖子内容：取前15个字符

        resultList.forEach((item, index) => {
            let {postStar, postTop, postGlobal, postGlobalTop, deleteFlag, isHide, postTabs, content, externalLinks} = item;

            /*==================== 状态 ==================*/
            let statusArr = [];

            deleteFlag && statusArr.push('已删除');

            if(isHide) {
                if (isHide == 1) {
                    statusArr.push('人工屏蔽');
                } else if(isHide == 2) {
                    statusArr.push('系统屏蔽');
                } else if(isHide == 3) {
                    statusArr.push('待审核');
                }
            }

            !statusArr.length && statusArr.push('正常');
            postStar && statusArr.push('加精');
            postTop && statusArr.push('置顶');
            postGlobal && statusArr.push('全局');
            postGlobalTop && statusArr.push('全局置顶');
            !isHide && !deleteFlag && postTabs && postTabs.length && statusArr.push(postTabs.join(','));

            item.status = statusArr.join(' | ');
            /*==================== 状态 ==================*/

            /**=================== 操作面板 ===================== */
            let userRole = common.getUserInfo().userRole;
            let editInfoArr = [];

            let starText = postStar ? '取消加精' : '加精';
            let starClass = postStar ? 'cancel-post-star' : 'post-star';
            let topText = postTop ? '取消置顶' : '置顶';
            let topClass = postTop ? 'cancel-post-top' : 'post-top';
            let globalTopClass = postGlobalTop ? 'cancel-post-global-top' : 'post-global-top';
            let globalTopText = postGlobalTop ? '取消全局置顶' : '全局置顶';
            let deleteText = deleteFlag ? '恢复' : '删除';
            let deleteClass = deleteFlag ? 'cancel-delete' : 'delete-post';
            let hideText = isHide ? '恢复' : '屏蔽';
            let hideClass = isHide ? 'cancel-hide' : 'hide-post';

            if (!isHide && !deleteFlag) {
                //正常帖
                editInfoArr.push({text: starText, className: starClass});
                editInfoArr.push({text: topText, className: topClass});
                //只有研发可以全局置顶
                if (userRole.toLowerCase().indexOf('dev') != -1) {
                    editInfoArr.push({text: globalTopText, className: globalTopClass});
                }
                editInfoArr.push({text: hideText, className: hideClass});
            }

            //学院-版主和军团-运营不能删帖
            if ((userRole.indexOf('SALE_SOP') == -1) && (userRole.indexOf('SCH_BM') == -1)) {
                //不是班主任和军团，显示全部的操作项
                //正常帖
                if (!isHide && !deleteFlag) {
                    editInfoArr.push({text: deleteText, className: deleteClass});
                } else {  //非正常帖
                    if (isHide) {
                        editInfoArr.push({text: hideText, className: hideClass});
                    }
                    if (deleteFlag) {
                        editInfoArr.push({text: deleteText, className: deleteClass});
                    }
                }
            }
            //学院-版主可以屏蔽帖子和恢复被屏蔽帖
            if (userRole.indexOf('SCH_BM') != -1) {
                if (isHide) {
                    //被屏蔽的帖子
                    editInfoArr.push({text: hideText, className: hideClass});
                }
            }
            if (userRole.indexOf('SALE_SOP') != -1) {
                if (isHide) {
                    //被屏蔽的帖子
                    editInfoArr.push({text: hideText, className: hideClass});
                }
            }

            item.editInfo = editInfoArr;
            /**=================== 操作面板 ===================== */

            /**=================== 帖子url ===================== */
            if (postType == 0) {
                item.postUrl = envCfg.postBaseUrl + item.postMasterId + '?forbid=0';
            } else {
                item.postUrl = envCfg.postBaseUrl + item.postMasterId;
            }
            
            
            /**=================== index =================== */
            item.index = index;

            //话题帖标题可能为空
            item.postSubject = item.postSubject || (item.content.substr(0, 10) + '...');

            //话题内容-内容长度限定在15个字符以内
            if(+postType == 1) {
                showContentNoPic = true;
                    if(content == null) {
                        item.content = '';
                }
                        item.content = content.length > 15 ? content.substr(0, 15) + '...' : content;
                        item.contentTitle = content.length > 200 ? content.substr(0, 200) + '...' : content;
                if(!content && externalLinks == 1) {
                    item.content = '[图片]';
                    item.contentTitle = '[图片]';
                    }

                }

            //手机号码后两位隐藏
            item.userMobile = item.userMobile ? `${item.userMobile.toString().substr(0, 9)}**`: item.userMobile;

        })

        return {resultList, showPostPurpose, showSortBtn, showTransferBtn, showThumbupCommentsNumber, showTopics, canEditTopic, showContentNoPic};
    },

    render() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    },

    //是否可以批量操作
    canBatchOperate(checked_index, flag) {
        let {resultList}  = this.model.toJSON();
        if(flag == 1) {
            let temptFlag = false;                      //恢复删除主贴
            checked_index.forEach((item, index) => {
                let {deleteFlag, isHide} = resultList[item];
                if(deleteFlag == 0) {
                    temptFlag = true;
                }
            })
            return temptFlag;
        } else if(flag==2) {                      //恢复屏蔽主贴
            let temptFlag = false;
            checked_index.forEach((item, index) => {
                let {deleteFlag, isHide} = resultList[item];
                if(isHide == 0) {
                    temptFlag = true;
                }
            })
            return temptFlag;
        }
    },

    //复选框数目大于等于2，列表右边操作列被禁用
    changeCheckedStatus(checkedNumber) {
        if(checkedNumber >= 2) {
            this.$el.find(".list-disable").addClass("disabled");
        } else {
            this.$el.find(".list-disable").removeClass("disabled");
        }
    }
})

export {Items}
