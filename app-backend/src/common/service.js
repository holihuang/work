/*
 * @file 请求配置文件
 * @author hualuyao
 */

import { url } from './url'
import { common } from './common'
import { validate } from './validate'
import { envCfg } from './envCfg'
import { loadingReq } from './loadingReq'
import _ from 'lodash'

var reqList = [];

var service = {
    //通用请求函数
    post: function(reqUrl, params, callback, handleFail) {

        var userInfo = common.getUserInfo();

        params.channelCode = params.channelCode || 'CS_BACKGROUND';

        if (!_.isEmpty(userInfo)) {
        	if (!params.creater) {
	            params.creater = userInfo.userAccount;
	        }

	        params.updater = userInfo.userAccount;

	        //群聊和单聊用到的imUserId不一样，这里统一拦截处理一下
	        if (/groupchatManager/.test(reqUrl)) {
	            params.imUserId = params.imUserId || userInfo.imIdForGroup;
	        } else {
	            params.imUserId = params.imUserId || userInfo.imId;
	        }
        }

        var reqParams = JSON.stringify({reqUrl, params});

        if (reqList.indexOf(reqParams) === -1) {
            reqList.push(reqParams);
        } else {
            return;
        }

        //是否加载loading动画
        if (loadingReq.indexOf(reqUrl) != -1) {
            //需要加载loading动画
            common.loading();
        }

        var formData = new FormData();
        formData.append('data', JSON.stringify(params));

        $.ajax({
            url: reqUrl,
            type: 'post',
            mimeType:"multipart/form-data",
            data: formData,
            contentType: false,
            cache: false,
            processData:false,
            // crossDomain: true,
            crossDomain: false,
            dataType: 'json'
        }).done(function(response) {
            if (callback) {
                callback(response);
            }

            //去掉loading动画
            setTimeout(() => {
                common.removeLoading();
            }, 500)

            //移除
            let index = reqList.indexOf(reqParams);
            reqList.splice(index, 1);
        }).fail(function(jqXHR, textStatus) {

            //去掉loading动画
            setTimeout(() => {
                common.removeLoading();
            }, 500)

            //移除
            let index = reqList.indexOf(reqParams);
            reqList.splice(index, 1);

            if (handleFail) {
                handleFail();
                return;
            }

            //本项目中，当处于未登录状态请求时，接口会重定向到login.jsp；
            //302请求不能改变请求方式，所以会向login.jsp发送post请求，返回值为html字符串
            //返回状态为200 ok
            //这种处理实为后台bug
            //我这里先根据当前的方式做个简单处理，检测返回并跳转到登录页。
            switch (jqXHR.status) {
                case 200:
                    //说明是未登录，返回了200，但是出现了parsererror错误
                    //为了进一步确定，判断responseText
                    if (jqXHR.responseText.indexOf('<!DOCTYPE') != -1) {
                        window.location.href = envCfg.loginUrl;
                    } else {
                        //alert(jqXHR.responseText);
                        //说明是接口返回数据格式错误导致解析失败
                        alert('网络有点问题，请刷新页面试试'); //PM说先按这样来提示
                    }
                    break;
                case 401:
                    // 未登录
                    console.warn('当前未登录，请通过sso登录')
                    // sso标志，需要定向到单点页面 本地环境暂不添加sso服务
                    if (process.env.NODE_ENV === 'dev') {
                        location.href = '/dev_login'
                    } else {
                        location.href = envCfg.loginUrl
                    }
                    break
                case 404:
                    // 接口不存在
                    alert('请求接口不存在')
                    break
                case 704:
                    // 登录互踢
                    console.warn('多方登录，被踢下线')
                    let { userId, userAccount, imUserId } = common.getUserInfo()
                    // sso登出，无需参数和回调
                    service.getSSOLogout({
                        userId: +userId,
                        imUserId: +imUserId,
                        userAccount,
                    }, (response) => {
                        if(response.rs) {
                            location.href = envCfg.logoutUrl
                        } else {
                            console.warn('logout 服务失败')
                        }
                    })
                    break;
                default:
                    alert('请求数据失败，请稍后再试！');
                    break;
            }
        })
    },

    getUserAccount: function(params, callback) {
        this.post(url.GET_USER_Account, params, callback)
    },

    getSSOLogout: function(params, callback) {
        this.post(url.GET_SSO_Logout, params, callback)
    },

    manageRobot: function(params, callback) {
        this.post(url.MANAGE_ROBOT, params, callback)
    },

    manageGuessAsk: function(params, callback) {
        this.post(url.MANAGE_GUESS_ASK, params, callback)
    },

    adminAddOptInfo: function(params, callback) {
        this.post(url.ADMIN_ADD_OPT_INFO, params, callback);
    },

    adminUpdateOptInfo: function(params, callback) {
        this.post(url.ADMIN_UPDATE_OPT_INFO, params, callback);
    },

    adminDeleteOptById: function(params, callback) {
        this.post(url.ADMIN_DELETE_OPT_BY_ID, params, callback);
    },

    adminGetOptInfoById: function(params, callback) {
        this.post(url.ADMIN_GET_OPT_INFO_BY_ID, params, callback);
    },

    adminUpdateStateById: function(params, callback) {
        this.post(url.ADMIN_UPDATE_STATE_BY_ID, params, callback);
    },

    adminGetOptListByCollege: function(params, callback) {
        this.post(url.ADMIN_GET_OPT_LIST_BY_COLLEGE, params, callback);
    },

    adminGetOptList: function(params, callback) {
        this.post(url.ADMIN_GET_OPT_LIST, params, callback);
    },

    adminGetFirstProjectList: function(params, callback) {
        this.post(url.ADMIN_GET_FIRST_PROJECT_LIST, params, callback);
    },

    adminGetSecProjectList: function(params, callback) {
        this.post(url.ADMIN_GET_SEC_PROJECT_LIST, params, callback);
    },

    adminGetOperationLog: function(params, callback) {
        this.post(url.ADMIN_GET_OPERATION_LOG, params, callback);
    },

    listAllCorps: function(params, callback) {
        this.post(url.LIST_ALL_CORPS, params, callback);
    },

    getTodayMotto: function(params, callback) {
        this.post(url.GET_TODAY_MOTTO, params, callback);
    },

    addTodayMotto: function(params, callback) {
        if (validate.addTodayMotto(params)) {
            this.post(url.ADD_TODAY_MOTTO, params, callback);
        }
    },

    updateTodayMotto: function(params, callback) {
        if (validate.updateTodayMotto(params)) {
            this.post(url.UPDATE_TODAY_MOTTO, params, callback);
        }
    },

    getAllNativePage: function(params, callback) {
        this.post(url.GET_ALL_NATIVE_PAGE, params, callback);
    },
    getAllSkipPage: function(params, callback) {
        this.post(url.GET_ALL_SKIP_PAGE, params, callback);
    },

    getAllCourseVIP: function(params, callback) {
        this.post(url.GET_ALL_COURSE_VIP, params, callback);
    },

    insertBrandVIP: function(params, callback) {
        if (validate.insertBrandVIP(params)) {
            this.post(url.INSERT_BRAND_VIP, params, callback);
        }
    },

    getAllFreeClass: function(params, callback) {
        this.post(url.GET_ALL_FREE_CLASS, params, callback);
    },

    //福利活动
    listAnnouncement: function(params, callback) {
        this.post(url.LIST_ANNOUNCEMENT, params, callback);
    },
    insertAnnouncement: function(params, callback) {
        if (validate.insertAnnouncement(params)) {
            this.post(url.INSERT_ANNOUNCEMENT, params, callback);
        }
    },
    deleteAnnouncement: function(params, callback) {
        this.post(url.DELETE_ANNOUNCEMENT, params, callback);
    },
    updateAnnouncement: function(params, callback) {
        if (validate.updateAnnouncement(params)) {
            this.post(url.UPDATE_ANNOUNCEMENT, params, callback);
        }
    },

    getChatMessageList: function(params, callback) {
        this.post(url.GET_CHAT_MESSAGE_LIST, params, callback);
    },

    getChatMessagesByUserId: function(params, callback) {
        this.post(url.GET_CHAT_MESSAGES_BY_USER_ID, params, callback);
    },

    showAllParentAlbums: function(params, callback) {
        this.post(url.SHOW_ALL_PARENT_ALBUMS, params, callback);
    },

    notAssociateCollege: function(params, callback) {
        this.post(url.NOT_ASSOCIATE_COLLEGE, params, callback);
    },

    createNewParentAlbum: function(params, callback) {
        if (validate.createNewParentAlbum(params)) {
            this.post(url.CREATE_NEW_PARENT_ALBUM, params, callback);
        }
    },

    delParentAlbum: function(params, callback) {
        this.post(url.DEL_PARENT_ALBUM, params, callback);
    },

    getChildAlbumByParentId: function(params, callback) {
        this.post(url.GET_CHILDALBUN_BY_PARENTID, params, callback);
    },

    notAssociateSecProject: function(params, callback) {
        this.post(url.NOT_ASSOCIATE_SEC_PROJECT, params, callback);
    },

    updateChildAlbumSec: function(params, callback) {
        this.post(url.UPDATE_CHILD_ALBUM_SEC, params, callback);
    },

    deleteChildAlbumSec: function(params, callback) {
        this.post(url.DELETE_CHILD_ALBUN_SEC, params, callback);
    },

    createChildAlbumSec: function(params, callback) {
        this.post(url.CREATE_CHILD_ALBUM_SEC, params, callback);
    },

    listAlbumOperateLog: function(params, callback) {
        this.post(url.LIST_ALBUM_LOG, params, callback);
    },

    adminAddAssociateSecProject: function(params, callback) {
        this.post(url.ADD_ASSOCIATE_SECPROJECT, params, callback);
    },

    adminDelAssociateSecProject: function(params, callback) {
        this.post(url.DEL_ASSOCIATE_SECPROJECT, params, callback);
    },

    listAllCollegeSec: function(params, callback) {
        this.post(url.LIST_ALL_COLLEGE_SEC, params, callback);
    },

    updateParentAlbum: function(params, callback) {
        this.post(url.UPDATE_PARENT_ALBUM, params, callback);
    },

    showAllChildAlbums: function(params, callback) {
        this.post(url.SHOW_ALL_CHILD_ALBUMS, params, callback);
    },

    updateChildAlbum: function(params, callback) {
        this.post(url.UPDATE_CHILD_ALBUM, params, callback);
    },

    createNewChildAlbum: function(params, callback) {
        if (validate.createNewChildAlbum(params)) {
            this.post(url.CREATE_NEW_CHILD_ALBUM, params, callback);
        }
    },

    sendMessageToUserId: function(params, callback) {
        this.post(url.SEND_MESSAGE_TO_USER_ID, params, callback);
    },

    deleteFreeClass: function(params, callback) {
        this.post(url.DELETE_FREE_CLASS, params, callback);
    },

    getAdminBannedList: function(params, callback) {
        this.post(url.ADMIN_BANNED_LIST, params, callback);
    },

    adminDownloadBannedList: function(params, callback) {
        common.downloadFile({
            url: url.ADMIN_DOWNLOAD_BANNED_LIST,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    getAdminUpdateBanned(params, callback) {
        this.post(url.ADMIN_UPDATE_BANNED, params, callback);
    },

    adminSetBanPolicy(params, callback) {
        this.post(url.ADMIN_SET_BAN_POLICY, params, callback);
    },
    
    adminGetBanPolicy(params, callback) {
        this.post(url.ADMIN_GET_BAN_POLICY, params, callback);
    },

    configPermissionByUserId: function(params, callback) {
        this.post(url.CONFIG_PERMISSION_BY_USERID, params, callback);
    },

    getBackendAuthorityByUserAccount: function(params, callback) {
        this.post(url.GET_BACKEND_AUTHORITY_BY_USER_ACCOUNT, params, callback);
    },

    addBackendAuthorityByUserAccount: function(params, callback) {
        this.post(url.ADD_BACKEND_AUTHORITY_BY_USER_ACCOUNT, params, callback);
    },

    configBackendAuthorityByUserAccount: function(params, callback) {
        this.post(url.CONFIG_BACKEND_AUTHORITY_BY_USER_ACCOUNT, params, callback);
    },

    getRolesList: function(params, callback) {
        this.post(url.GET_ROLES_LIST, params, callback);
    },

    getMenuListByRoleId: function(params, callback) {
        this.post(url.GET_MENU_LIST_BY_ROLE_ID, params, callback);
    },

    addRoleByUserAccount: function(params, callback) {
        this.post(url.ADD_ROLE_BY_USER_ACCOUNT, params, callback);
    },

    configRoleByUserAccount: function(params, callback) {
        this.post(url.CONFIG_ROLE_BY_USER_ACCOUNT, params, callback);
    },

    retrievePostListByAlbumParentId: function(params, callback) {
        this.post(url.RETRIEVE_POST_LIST_BY_ALBUM_PARENT_ID, params, callback);
    },

    retrievePostListByAlbumChildId: function(params, callback) {
        this.post(url.RETRIEVE_POST_LIST_BY_ALBUM_CHILD_ID, params, callback);
    },

    updateFreeClass: function(params, callback) {
        if (validate.updateFreeClass(params)) {
            this.post(url.UPDATE_FREE_CLASS, params, callback);
        }
    },

    configureFreeClass: function(params, callback) {
        if (validate.configureFreeClass(params)) {
            this.post(url.CONFIGURE_FREE_CLASS, params, callback);
        }
    },

    updateBrandVIP: function(params, callback) {
        this.post(url.UPDATE_BRAND_VIP, params, callback);
    },

    getBrandVipModuleByCourseId: function(params, callback) {
        this.post(url.GET_BRAND_VIP_MODULE_BY_COURSEID, params, callback);
    },

    getChatUserDetail: function(params, callback) {
        this.post(url.GET_CHAT_USER_DETAIL, params, callback);
    },

    insertCoursePackage: function(params, callback) {
        if (validate.insertCoursePackage(params)) {
            this.post(url.INSERT_COURSE_PACKAGE, params, callback);
        }
    },

    deleteCoursePackage: function(params, callback) {
        this.post(url.DELETE_COURSE_PACKAGE, params, callback);
    },

    getCoursePackageByCourseId: function(params, callback) {
        this.post(url.GET_COURSE_PACKAGE_BY_COURSEID, params, callback);
    },

    getMessageAdminSearchUser: function(params, callback) {
        this.post(url.GET_MESSAGE_ADMIN_SEARCH_USER, params, callback);
    },

    //pc社区广告
    getPcSocialAd: function(params, callback) {
        this.post(url.GET_PC_SOCIAL_AD, params, callback);
    },

    addPcSocialAd: function(params, callback) {
        if (validate.addPcSocialAd(params)) {
            this.post(url.ADD_PC_SOCIAL_AD, params, callback);
        }
    },

    getAllCollege: function(params, callback) {
        this.post(url.GET_ALL_COLLEGE, {}, callback);
    },

    updatePcSocialAd: function(params, callback) {
        this.post(url.UPDATE_PC_SOCIAL_AD, params, callback);
    },

    deletePcSocialAd: function(params, callback) {
        this.post(url.DELETE_PC_SOCIAL_AD, params, callback);
    },

    getOperationLog: function(params, callback) {
        this.post(url.GET_OPERATION_LOG, params, callback);
    },
    /*******************精选话题查询接口***********************/
    selectedTopicsListData: function(params, callback) {
        this.post(url.GET_SELECTEDTOPICS_LIST_DATA, params, callback);
    },
    //
    adminExportTopicList: function(params, callback) {
        // this.post(url.ADMIN_EXPORT_TOPIC_LIST, params, callback);
        common.downloadFile({
            url: url.ADMIN_EXPORT_TOPIC_LIST,
            data: {
                data: JSON.stringify(params)
            }
        })
    },
    //获得分类数据
    getTopicClassify: function(params, callback) {
        this.post(url.GET_TOPIC_CLASSIFY, params, callback);
    },
    /******************精选话题新增话题接口***********************/
    addSelectedTopics: function(params, callback) {
        if(validate.addOrUpdateSelectedTopics(params)) {
            this.post(url.GET_ADDSELECTEDTOPICS_DATA, params, callback);
        }
    },
    updateSelectedTopics: function(params, callback) {
        if(validate.addOrUpdateSelectedTopics(params)) {
            this.post(url.GET_UPDATESELECTEDTOPICS_DATA, params, callback);
        }
    },
    disOrHideItems: function(params, callback) {
        this.post(url.GET_DISORHIDEITEMS_DATA, params, callback);
    },
    /*********************精选话题-删除操作***************************/
    deleteTopicInfoItems: function(params, callback) {
        this.post(url.GET_DELETETOPICINFOITEMS_DATA, params, callback);
    },
    /**********************精选话题-设置分类*************************/
    adminSetTopicClass(params, callback) {
        this.post(url.ADMIN_SET_TOPIC_CLASS, params, callback);
    },
    //精选话题-获取分类列表
    adminGetTopicClass(params, callback) {
        this.post(url.ADMIN_GET_TOPIC_CLASS, params, callback);
    },
    //精选话题-新增-用户归属-学院列表
    getSelectedCollegeList: function(params, callback) {
        this.post(url.GET_SELECTED_COLLEGELIST_DATA, params, callback);
    },
    //精选话题-新增-用户归属-家族列表
    getSelectedFamilyList: function(params, callback) {
        this.post(url.GET_SELECTED_FAMILYLIST_DATA, params, callback);
    },
    //精选话题-新增-更新-校验轮次Id是否存在API
    checkRoundIdList: function(params, callback) {
        this.post(url.NO_ROUND_ID_LIST, params, callback);
    },
    //删除帖子
    deletePostByUserId: function(params, callback) {
        this.post(url.DELETE_POST_BY_USER_ID, params, callback);
    },

    //恢复帖子
    recoverPostMasterByManager: function(params, callback) {
        this.post(url.RECOVER_POST_MASTER, params, callback);
    },

    //帖子置顶
    updatePostMasterTop: function(params, callback) {
        this.post(url.UPDATE_POST_MASTER_TOP, params, callback);
    },

    //帖子加精
    updatePostMasterStar: function(params, callback) {
        this.post(url.UPDATE_POST_MASTER_STAR, params, callback);
    },

    //帖子全局
    updatePostMasterGlobal: function(params, callback) {
        this.post(url.UPDATE_POST_MASTER_GLOBAL, params, callback);
    },

    updatePostMasterGlobalTop: function(params, callback) {
        this.post(url.UPDATE_POST_MASTER_GLOBAL_TOP, params, callback);
    },

    retrievePostReplyList: function(params, callback) {
        this.post(url.RETRIEVE_POST_REPLY_LIST, params, callback);
    },

    updatePostReplyDeleteFlag: function(params, callback) {
        this.post(url.UPDATE_POST_REPLY_DELETE_FLAG, params, callback);
    },

    updatePostReplyHideState: function(params, callback) {
        this.post(url.UPDATE_POST_REPLY_HIDE_STATE, params, callback);
    },

    getPostReplyOperationLog: function(params, callback) {
        this.post(url.GET_POST_REPLY_OPERATION_LOG, params, callback);
    },

    //查看操作日志
    getPostOperationLog: function(params, callback) {
        this.post(url.GET_POST_OPERATION_LOG, params, callback);
    },

    retrievePostList: function(params, callback) {
        this.post(url.RETRIEVE_POST_LIST, params, callback);
    },

    //查看发帖动机
    retrievePostPurpose: function(params, callback) {
        this.post(url.RETRIEVE_POST_PURPOSE, params, callback);
    },

    //根据主贴id查询帖子所属分类
    retrieveMasterTypeById: function(params, callback) {
        this.post(url.RETRIEVE_MASTER_TYPE_BY_ID, params, callback);
    },

    //编辑帖子分类
    updateMasterType: function(params, callback) {
        this.post(url.UPDATE_MASTER_TYPE, params, callback);
    },

    retrieveSlavePostList: function(params, callback) {
        this.post(url.RETRIEVE_SLAVE_POST_LIST, params, callback);
    },

    updatePostSlaveHideState: function(params, callback) {
        this.post(url.UPDATE_POST_SLAVE_HIDE_STATE, params, callback);
    },

    updatePostSlaveDeleteFlag: function(params, callback) {
        this.post(url.UPDATE_POST_SLAVE_DELETE_FLAG, params, callback);
    },

    getPostSlaveOperationLog: function(params, callback) {
        this.post(url.GET_POST_SLAVE_OPERATION_LOG, params, callback);
    },

    updatePostMasterHideState: function(params, callback) {
        this.post(url.UPDATE_POST_MASTER_HIDE_STATE, params, callback);
    },

    slavePostDownload: function(params, callback) {
        //this.post(url.SLAVE_POST_DOWNLOAD, params, callback);
        common.downloadFile({
            url: url.SLAVE_POST_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    normalPostDownload: function(params, callback) {
        //this.post(url.NORMAL_POST_DOWNLOAD, params, callback);
        common.downloadFile({
            url: url.NORMAL_POST_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    dhPostDownload: function(params, callback) {
        //this.post(url.DH_POST_DOWNLOAD, params, callback);
        common.downloadFile({
            url: url.DH_POST_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    replyPostDownload: function(params, callback) {
        common.downloadFile({
            url: url.REPLY_POST_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    dhPostReplyDownload: function(params, callback) {
          common.downloadFile({
            //to config the URL
            url: url.DH_POST_REPLY_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
          })
    },

    dhPostSlaveDownload: function(params, callback) {
        common.downloadFile({
            //to config the URL
            url: url.DH_POST_SLAVE_DOWNLOAD,
            data: {
                data: JSON.stringify(params)
            }
        })
    },

    transferPostMaster: function(params, callback) {
        this.post(url.TRANSFER_POST_MASTER, params, callback);
    },
    showNicknames: function(params, callback) {
        this.post(url.SHOW_NICK_NAMES, params, callback);
    },

    sendMessageByTeacher: function(params, callback, handleFail) {
        this.post(url.SEND_MESSAGE_BY_TEACHER, params, callback, handleFail);
    },

    // getChatMessagesByTeacher: function(params, callback) {
    //     this.post(url.GET_CHAT_MESSAGES_BY_TEACHER, params, callback);
    // },

    getTeacherByCondition: function(params, callback) {
        this.post(url.GET_TEACHER_BY_CONDITION, params, callback);
    },

    getHistoryMsg: function(params, callback) {
        this.post(url.GET_HISTORY_MSG, params, callback);
    },

    modifyMessageTop: function(params, callback) {
        this.post(url.MODIFY_MESSAGE_TOP, params, callback);
    },

    //聊天消息记录
    getHistoryChatMessageList: function(params, callback) {
        this.post(url.GET_HISTORY_CHAT_MESSAGE_LIST, params, callback);
    },

    //获取班主任学员列表
    getStudentsList: function(params, callback) {
        this.post(url.GET_STUDENTS_LIST, params, callback);
    },

    sendFailGroupMessage: function(params, callback) {
        this.post(url.SEND_FAIL_GROUP_MESSAGE, params, callback);
    },

    //获取学员信息
    getStudentDetail: function(params, callback){
        this.post(url.GET_STUDENT_DETAIL, params, callback);
    },

    //提交编辑的学员备注信息
    editStudentDesc: function(params, callback){
        this.post(url.EDIT_STUDENT_DESC, params, callback);
    },

    //获取数据统计页面的数据
    getStatisticData: function(params, callback){
        this.post(url.GET_STATISTIC_DATA, params, callback);
    },

    // 图标管理-查询接口
    adminGetIconList: function(params, callback) {
        this.post(url.ADMIN_GET_ICON_LIST, params, callback);
    },

    // 图标管理-新增
    adminAddIcon: function(params, callback) {
        this.post(url.ADMIN_ADD_ICON, params, callback);
    },

    // 图标管理-新增变更-图标名称列表
    adminRetrieveAllButton: function(params, callback) {
        this.post(url.ADMIN_RETRIEVE_ALL_BUTTON, params, callback);
    },

    // 图标管理-更新
    adminUpdateIcon: function(params, callback) {
        this.post(url.ADMIN_UPDATE_ICON, params, callback);
    },

    // 图标管理-删除
    deleteIconById: function(params, callback) {
        this.post(url.DELETE_ICON_BY_ID, params, callback);
    },

    // 图标管理-下线
    adminUpdateIconStateById: function(params, callback) {
        this.post(url.ADMIN_UPDATE_ICON_STATE_BY_ID, params, callback);
    },

    //获取首页热帖-推荐页面的数据
    getHotPostsRecommendationData: function(params, callback){
      this.post(url.GET_HOTPOSTSREC_DATA, params, callback);
    },
    //获取首页热帖-屏蔽页面数据
    getHotPostsShieldData: function(params, callback) {
      this.post(url.GET_HOTPOSTSSHIELD_DATA, params, callback);
    },
    //获取首页热帖-推荐-新增的数据
    getAddPostsRecommendationData: function(params, callback){
    this.post(url.GET_ADDPOSTSREC_DATA, params, callback);
    },
    //首页热帖-新增API
    addPostsPic: function (params, callback) {
      this.post(url.GET_ADDPOSTS_PIC, params, callback);
    },
    //首页热帖-新增屏蔽
    addShield: function  (params, callback) {
      this.post(url.GET_ADDSHIELD_DATA, params, callback);
    },
    //获取首页热帖-查看 数据
    viewCheckLog: function(params, callback) {
      this.post(url.VIEW_CHECK_LOG, params, callback);
    },
    //首页热帖-屏蔽-取消屏蔽|屏蔽
    shieldHotPosts: function(params, callback) {
      this.post(url.GET_SHIELDHOTPOSTS_DATA, params, callback);
    },
    //获取首页热帖-更新 数据
    updateHotPosts: function (params, callback) {
      this.post(url.UPDATE_HOT_POSTS,params, callback);
    },
    //vip学员推荐-下线
    adminUpdateSuggestState(params, callback) {
        this.post(url.ADMIN_UPDATE_SUGGEST_STATE, params, callback);
    },
    // 新增||更新 家族列表
    listFamilyByColleges(params, callback) {
        this.post(url.LIST_FAMILY_BY_COLLEGES, params, callback);
    },
    //推荐热帖（首页热帖）-话题名称-下拉框API
    getTopicNameList: function(params, callback) {
        this.post(url.GET_TOPICNAME_LIST_DATA, params, callback);
    },

    //推荐热帖-非付费学员推荐-查询API
    getUnpayedList: function(params, callback) {
      this.post(url.GET_UNPAYED_DATA, params, callback)
    },

    //推荐热帖-非付费学员推荐-推荐设置API
    setUnPaidSuggestedPost: function(params, callback) {
        this.post(url.SET_UNPAID_SUGGESTED_POST, params, callback);
    },

    //推荐热帖-变更展示规则
    updateUnPaidHotShowScope: function(params, callback) {
        this.post(url.UPDATE_UNPAID_HOST_SHOWSCOPE, params, callback);
    },

    //推荐热帖-非付费学员推荐-删除API
    deleteNewUnpayedHotMasterPosts: function(params, callback) {
        this.post(url.DELETE_NEW_UNPAYED_HOT_MASTER_POSTS, params, callback);
    },
    //推荐热帖-非付费学员-新增API
    addNewUnpayed: function(params, callback) {
        this.post(url.ADD_NEW_UNPAYED_HOT_MASTER_POST, params, callback);
    },
    //推荐热帖-非付费学员-批量新增API
    addNewUnpayedPosts: function(params, callback) {
        this.post(url.ADD_NEW_UNPAYED_HOT_MASTER_POSTS, params, callback);
    },
    //推荐热帖-非付费学员-上传文件API
    getUploadFile: function(params, callback) {
        this.post(url.GETPOSTUPLOAD_UNPAYED_HOT_MASTER_POST_FILE, params, callback);
    },

  /**群发消息 */
    getTeacherPackageNames: function(params, callback) {
        this.post(url.GET_TEACHER_PACKAGE_NAMES, params, callback);
    },
    getGroupStudentsList: function(params, callback) {
        this.post(url.GET_GROUP_STUDENTS_LIST, params, callback);
    },
    createTeacherGroupBatch: function(params, callback) {
        this.post(url.CREATE_TEACHER_GROUP_BATCH, params, callback);
    },
    getGroupChatMessageList: function(params, callback) {
        this.post(url.GET_GROUP_CHAT_MESSAGE_LIST, params, callback);
    },
    getGroupChatByMessageId: function(params, callback) {
        this.post(url.GET_GROUP_CHAT_BY_MESSAGE_ID, params, callback);
    },
    getAllProvinces: function(params, callback) { //省份
        this.post(url.GET_ALL_PROVINCES, params, callback);
    },

    //发送服务评价
    sendEvaluationByTeacher: function(params, callback) {
        this.post(url.SEND_EVALUATION_BY_TEACHER, params, callback);
    },

    //系统自动回复话术配置
    getAllAutoReplys: function(params, callback) {
        this.post(url.GET_ALL_AUTO_REPLYS, params, callback);
    },
    editAutoReply: function(params, callback) {
        this.post(url.EDIT_AUTO_REPLY, params, callback);
    },
    delAutoReply: function(params, callback) {
        this.post(url.DEL_AUTO_REPLY, params, callback);
    },
    viewAutoReplyLog: function(params, callback) {
        this.post(url.VIEW_AUTO_REPLY_LOG, params, callback);
    },

    /*
     * 快捷回复
     */
    //获取快捷回复列表
    getCommonPhraseList: function(params, callback) {
        this.post(url.GET_COMMON_PHRASE_LIST, params, callback)
    },

    //添加快捷回复
    addCommonPhrase: function(params, callback) {
        this.post(url.ADD_COMMON_PHRASE, params, callback)
    },

    //修改快捷回复
    editCommonPhrase: function(params, callback) {
        this.post(url.EDIT_COMMON_PHRASE, params, callback)
    },

    //删除快捷回复
    deleteCommonPhrase: function(params, callback) {
        this.post(url.DELETE_COMMON_PHRASE, params, callback)
    },

    //修改快捷回复内容位置
    moveCommonPhrasePosition: function(params, callback) {
        this.post(url.MOVE_COMMON_PHRASE_POSITION, params, callback)
    },

    // 添加快捷回复左侧标签ADD_QUICK_REPLY_LABEL
     addQuickReplyLabel: function(params, callback) {
         this.post(url.ADD_QUICK_REPLY_LABEL, params, callback)
     },

    // 重命名快捷回复左侧标签updateQuickReplyLabel
    updateQuickReplyLabel: function(params, callback) {
        this.post(url.UPDATE_QUICK_REPLY_LABEL, params, callback)
    },

    // 删除快捷回复左侧标签delQuickReplyLabel
    delQuickReplyLabel: function(params, callback) {
        this.post(url.DELETE_QUICK_REPLY_LABEL, params, callback)
    },

    // 快捷回复置顶topQuickReply
    topQuickReply: function(params, callback) {
        this.post(url.TOP_QUICK_REPLY, params, callback)
    },

    // 快捷回复发送次数
    countQuickReply: function(params, callback) {
        this.post(url.COUNT_QUICK_REPLY, params, callback)
    },

    //代班设置
    getCoverTeacherList: function(params, callback) {
        this.post(url.GET_COVER_TEACHER_LIST, params, callback);
    },
    setCoverTeacher: function(params, callback) {
        this.post(url.SET_COVER_TEACHER, params, callback);
    },
    updateCoverTeacher: function(params, callback) {
        this.post(url.UPDATE_COVER_TEACHER, params, callback);
    },
    delCoverTeacher: function(params, callback) {
        this.post(url.DEL_COVER_TEACHER, params, callback);
    },
    getRelationByStu: function(params, callback) {
        this.post(url.GET_RELATION_BY_STU, params, callback);
    },

    //敏感词
    getAllSensitiveDictionary: function(params, callback) {
        this.post(url.GET_ALL_SENSITIVE_DICTIONARY, params, callback);
    },
    getAllSensitiveWord: function(params, callback) {
        this.post(url.GET_ALL_SENSITIVE_WORD, params, callback);
    },
    getAllSensitiveType: function(params, callback) {
        this.post(url.GET_ALL_SENSITIVE_TYPE, params, callback);
    },
    addSensitiveType: function(params, callback) {
        this.post(url.ADD_SENSITIVE_TYPE, params, callback);
    },
    updateSensitiveType: function(params, callback) {
        this.post(url.UPDATE_SENSITIVE_TYPE, params, callback);
    },
    deleteSensitiveType: function(params, callback) {
        this.post(url.DELETE_SENSITIVE_TYPE, params, callback);
    },
    addSensitiveWord: function(params, callback) {
        this.post(url.ADD_SENSITIVE_WORD, params, callback);
    },
    updateSensitiveWord: function(params, callback) {
        this.post(url.UPDATE_SENSITIVE_WORD, params, callback);
    },
    deleteSensitiveWord: function(params, callback) {
        this.post(url.DELETE_SENSITIVE_WORD, params, callback);
    },


    //值班老师查看学员详细信息
    getStudentInfo: function(params, callback) {
        this.post(url.GET_STUDENT_INFO, params, callback);
    },
    editStudentByOnDutyTeacher: function(params, callback) {
        this.post(url.EDIT_STUDENT_BY_ON_DUTY_TEACHER, params, callback);
    },

    //值班老师
    listOnDutyTeacher: function(params, callback) {
        this.post(url.LIST_ON_DUTY_TEACHER, params, callback);
    },
    addOnDutyTeacher: function(params, callback) {
        this.post(url.ADD_ON_DUTY_TEACHER, params, callback);
    },
    updateOnDutyTeacher: function(params, callback) {
        this.post(url.UPDATE_ON_DUTY_TEACHER, params, callback);
    },
    deleteOnDutyTeacher: function(params, callback) {
        this.post(url.DELETE_ON_DUTY_TEACHER, params, callback);
    },

    //欢迎语
    listWelcomes: function(params, callback) {
        this.post(url.LIST_WELCOMES, params, callback);
    },
    addWelcomeMessage: function(params, callback) {
        this.post(url.ADD_WELCOME_MESSAGE, params, callback);
    },
    updateWelcomeMessage: function(params, callback) {
        this.post(url.UPDATE_WELCOME_MESSAGE, params, callback);
    },
    deleteWelcomeMessage: function(params, callback) {
        this.post(url.DELETE_WELCOME_MESSAGE, params, callback);
    },

    //获取学院和家族
    listAllCollege: function(params, callback) {
        this.post(url.LIST_ALL_COLLEGE, params, callback);
    },
    listAllFamily: function(params, callback) {
        this.post(url.LIST_ALL_FAMILY, params, callback);
    },
    listFamilyByCollege: function(params, callback) {
        this.post(url.LIST_FAMILY_BY_COLLEGE, params, callback);
    },

    //设置值班老师在线和离线状态
    getTeacherStatus: function(params, callback) {
        this.post(url.GET_TEACHER_STATUS, params, callback);
    },
    updateTeacherStatus: function(params, callback) {
        this.post(url.UPDATE_TEACHER_STATUS, params, callback);
    },
    getHistoryOnDutyMessageList: function(params, callback) {
        this.post(url.GET_HISTORY_ON_DUTY_MESSAGE_LIST, params, callback);
    },
    listRecordByDutyTeacher: function(params, callback) {
        this.post(url.LIST_RECORD_BY_DUTY_TEACHER, params, callback);
    },
    listLabelsDutyteacher: function(params, callback) {
        this.post(url.LIST_LABELS_DUTY_TEACHER, params, callback);
	},

    //精选话题
    adminSetTopicOnPost: function(params, callback) {
        this.post(url.ADMIN_SET_TOPIC_ON_POST, params, callback);
    },
    adminTopicList: function(params, callback) {
        this.post(url.ADMIN_TOPIC_LIST, params, callback);
    },
    adminEditTopicOnPost: function(params, callback) {
        this.post(url.ADMIN_EDIT_TOPIC_ON_POST, params, callback);
    },
    adminSearchTopicName(params, callback) {
        this.post(url.ADMIN_SEARCH_TOPIC_NAME, params, callback)
    },
    adminGetTopicName: function(params, callback) {
        this.post(url.ADMIN_GET_TOPIC_NAME, params, callback);
    },

    //用户成长体系
    listProductByManage: function(params, callback) {
        this.post(url.LIST_PRODUCT_BY_MANAGE, params, callback);
    },
    listProductCategory: function(params, callback) {
        this.post(url.LIST_PRODUCT_CATEGORY, params, callback);
    },
    getProductSellPeople: function(params, callback) {
        this.post(url.GET_PRODUCT_SELL_PEOPLE, params, callback);
    },
    addProduct: function(params, callback) {
        this.post(url.ADD_PRODUCT, params, callback);
    },
    updateProduct: function(params, callback) {
        this.post(url.UPDATE_PRODUCT, params, callback);
    },
    addSunlandAmount: function(params, callback) {
        this.post(url.ADD_SUNLAND_AMOUNT, params, callback);
    },
    listSunlandAmountRecord: function(params, callback) {
        this.post(url.LIST_SUNLAND_AMOUNT_RECORD, params, callback);
    },
    checkUserExist: function(params, callback) {
        this.post(url.CHECK_USER_EXIST, params, callback);
    },

    //信息通道部分
    listGroupBatch: function(params, callback) {
        this.post(url.LIST_GROUP_BATCH, params, callback);
    },

    exportGroupBatchs: function(params, callback) {
        common.downloadFile({
            url: url.EXPORT_GROUP_BATCHS,
            data: {
                data: JSON.stringify(params)
            }
        })
        // this.post(url.EXPORT_GROUP_BATCHS, params, callback);
    },

    addGroupBatch: function(params, callback) {
        this.post(url.ADD_GROUP_BATCH, params, callback);
    },

    addTeacherGroupBatch: function(params, callback) {
        this.post(url.ADD_TEACHER_GROUP_BATCH, params, callback);
    },

    deleteGroupBatch: function(params, callback) {
        this.post(url.DELETE_GROUP_BATCH, params, callback);
    },

    listNotifyFile: function(params, callback) {
        this.post(url.LIST_NOTIFY_FILE, params, callback);
    },

    deleteGroupMessageFile: function(params, callback) {
        this.post(url.DELETE_GROUP_MESSAGE_FILE, params, callback);
    },

    listGroupMessageFile: function(params, callback) {
        this.post(url.LIST_GROUP_MESSAGE_FILE, params, callback);
    },

    uploadNotifyFile: function(params, callback) {
        this.post(url.UPLOAD_NOTIFY_FILE, params, callback);
    },

    uploadGroupMessageFile: function(params, callback) {
        this.post(url.UPLOAD_GROUP_MESSAGE_FILE, params, callback);
    },

    deleteNotifyFile: function(params, callback) {
        this.post(url.DELETE_NOTIFY_FILE, params, callback);
    },

    getNotifyCount: function(params, callback) {
        this.post(url.GET_NOTIFY_COUNT, params, callback);
    },

    exportGroupExcel: function(params, callback) {
        common.downloadFile({
            url: url.EXPORT_GROUP_EXCEL,
            data: {
                data: JSON.stringify(params)
            }
        })
        // this.post(url.EXPORT_GROUP_EXCEL, params, callback);
    },

    getFileDetail: function(params, callback) {
        this.post(url.GET_FILE_DETAIL, params, callback);
    },

    getAllMessageType: function(params, callback) {
        this.post(url.GET_ALL_MESSAGE_TYPE, params, callback);
    },

    getPersByRole: function(params, callback) {
        this.post(url.GET_PERS_BY_ROLE, params, callback);
    },

    getGroupBatch: function(params, callback) {
        this.post(url.GET_GROUP_BATCH, params, callback);
    },

    addNotifyPopup: function(params, callback) {
        this.post(url.ADD_NOTIFY_POPUP, params, callback);
    },

    modifyNotifyPopup: function(params, callback) {
        this.post(url.MODIFY_NOTIFY_POPUP, params, callback);
    },

    getNotifyPopup: function(params, callback) {
        this.post(url.GET_NOTIFY_POPUP, params, callback);
    },

    getPersByRole: function(params, callback) {
        this.post(url.GET_PERS_BY_ROLE, params, callback);
    },

    //群聊部分
    getGroupDetails: function(params, callback) {
        this.post(url.GET_GROUP_DETAILS, params, callback);
    },
    updateGroupDetails: function(params, callback) {
        this.post(url.UPDATE_GROUP_DETAILS, params, callback);
    },
    getGroupStatus: function(params, callback) {
        this.post(url.GET_GROUP_STATUS, params, callback);
    },
    updateGroupState: function(params, callback) {
        this.post(url.UPDATE_GROUP_STATE, params, callback);
    },
    listGroupMembers: function(params, callback) {
        this.post(url.LIST_GROUP_MEMBERS, params, callback);
    },
    forbiddenUser: function(params, callback) {
        this.post(url.FORBIDDEN_USER, params, callback);
    },
    deleteUser: function(params, callback) {
        this.post(url.DELETE_USER, params, callback);
    },
    setCadreUser: function(params, callback) {
        this.post(url.SET_CADRE_USER, params, callback);
    },
    addNewMembers: function(params, callback) {
        this.post(url.ADD_NEW_MEMBERS, params, callback);
    },
    getGroupMessageList: function(params, callback) {
        this.post(url.GET_GROUP_MESSAGE_LIST, params, callback);
    },
    getHistoryGroupMessages: function(params, callback) {
        this.post(url.GET_HISTORY_GROUP_MESSAGES, params, callback);
    },
    getAllGroupMessageList: function(params, callback) {
        this.post(url.GET_ALL_GROUP_MESSAGE_LIST, params, callback);
    },
    getGroupMemberInfo: function(params, callback) {
        this.post(url.GET_GROUP_MEMBER_INFO, params, callback);
    },
    getGroupMessageFileDetail: function(params, callback) {
        this.post(url.GET_GROUP_MESSAGE_FILE_DETAIL, params, callback);
    },
    addGroupMessage: function(params, callback) {
        this.post(url.ADD_GROUP_MESSAGE, params, callback);
    },
    uploadGroupNameFile: function(onChange, callback) {
        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="file" required/>'
                + '</form>';
        var toElement = (function(){
            var div = document.createElement('div');
            return function(html){
                div.innerHTML = html;
                var el = div.firstChild;
                return div.removeChild(el);
            };
        })();
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            // var oData = new FormData(form);
            var fileName;
            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size} = files[0];
                let rs = onChange({name, size});
                if (rs === false) {
                    return;
                }
                fileName = name;
            }

            var oData = new FormData();
            oData.append('file', ipt.files[0], fileName);

            $.ajax({
                url: url.UPLOAD_GROUP_NAME_FILE,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },

    uploadGroupMessageFile: function(onChange, callback, params = {}) {
        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="file" required/>'
                + '</form>';
        var toElement = (function(){
            var div = document.createElement('div');
            return function(html){
                div.innerHTML = html;
                var el = div.firstChild;
                return div.removeChild(el);
            };
        })();
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            // var oData = new FormData(form);
            var fileName;
            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size} = files[0];
                let rs = onChange({name, size});
                if (rs === false) {
                    return;
                }
                fileName = name;
            }

            var oData = new FormData();
            for (let k in params) {
                oData.append(k, params[k]);
            }
            oData.append('file', ipt.files[0], fileName);

            $.ajax({
                url: url.UPLOAD_GROUP_MESSAGE_FILE,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },

    uploadNotifyFile: function(onChange, callback, params = {}) {
        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="file" required/>'
                + '</form>';
        var toElement = (function(){
            var div = document.createElement('div');
            return function(html){
                div.innerHTML = html;
                var el = div.firstChild;
                return div.removeChild(el);
            };
        })();
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            // var oData = new FormData(form);
            var fileName;
            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size} = files[0];
                let rs = onChange({name, size});
                if (rs === false) {
                    return;
                }
                fileName = name;
            }

            var oData = new FormData();
            for (let k in params) {
                oData.append(k, params[k]);
            }
            oData.append('file', ipt.files[0], fileName);

            $.ajax({
                url: url.UPLOAD_NOTIFY_FILE,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },
    insertGroupTalk: function(params, callback) {
        this.post(url.INSERT_GROUP_TALK, params, callback);
    },
    deleteGroup: function(params, callback) {
        this.post(url.DELETE_GROUP, params, callback);
    },
    transferGroupManager(params, callback) {
        this.post(url.TRANSFER_GROUP_MANAGER, params, callback);
    },
    listGroupTeacher(params, callback) {
        this.post(url.LIST_GROUP_TEACHER, params, callback);
    },
    getGroupAnnounce(params, callback) {
        this.post(url.GET_GROUP_ANNOUNCE, params, callback);
    },
    updateGroupAnnounce(params, callback) {
        this.post(url.UPDATE_GROUP_ANNOUNCE, params, callback);
    },
    deleteGroupAnnounce(params, callback) {
        this.post(url.DELETE_GROUP_ANNOUNCE, params, callback);
    },
    getImIdByAccount(params, callback) {
        this.post(url.GET_IM_ID_BY_ACCOUNT, params, callback);
    },

    //审核部分
    getConfigAppVersion: function(params, callback) {
        this.post(url.GET_CONFIG_APP_VERSION, params, callback);
    },

    setConfigAppVersion: function(params, callback) {
        this.post(url.SET_CONFIG_APP_VERSION, params, callback);
    },

    getAppKeys: function(params, callback) {
        this.post(url.GET_APP_KEYS, params, callback);
    },

    //学员问答
    adminQuestionList: function(params, callback) {
        this.post(url.ADMIN_QUESTION_LIST, params, callback);
    },

    adminGetQuestionById: function(params, callback) {
        this.post(url.ADMIN_GET_QUESTION_BY_ID, params, callback);
    },

    adminReplyQuestion: function(params, callback) {
        this.post(url.ADMIN_REPLY_QUESTION, params, callback);
    },

    adminUpdateQuestionState: function(params, callback) {
        this.post(url.ADMIN_UPDATE_QUESTION_STATE, params, callback);
    },

    adminAnswerList: function(params, callback) {
        this.post(url.ADMIN_ANSWER_LIST, params, callback);
    },

    adminSetHotAnswer:function(params, callback) {
        this.post(url.ADMIN_SET_HOT_ANSWER, params, callback);
    },

    adminGetAnswerById: function(params, callback) {
        this.post(url.ADMIN_GET_ANSWER_BY_ID, params, callback);
    },

    adminUpdateAnswerState: function(params, callback) {
        this.post(url.ADMIN_UPDATE_ANSWER_STATE, params, callback);
    },
     //IM单通道
    getMyStudent: function(params, callback) {
        this.post(url.GET_MY_STUDENT, params, callback);
    },
    getOrderDetailById: function(params, callback) {
        this.post(url.GET_ORDER_DETAIL_BY_ID, params, callback);
    },
    adminGetOrdDetailNo: function(params, callback) {
        this.post(url.ADMIN_GETORD_DETAILNO, params, callback)
    },
    getTeacherOffOrOnStatus: function(params, callback) {
        this.post(url.GET_TEACHER_OFF_OR_ON_STATUS, params, callback);
    },
    getCommunicationRecordUrl: function(params, callback) {
        this.post(url.GET_COMMUNICATION_RECORD, params, callback)
    },

    //图片审核-获取图片库
    listPicSuspected: function(params, callback) {
        this.post(url.LIST_PIC_SUSPECTED, params, callback);
    },

    //图片审核-获取删除记录
    listPicDelete: function(params, callback) {
        this.post(url.LIST_PIC_DELETE, params, callback);
    },

    //图片审核-人工标记违禁图
    prohibitedPic: function(params, callback) {
        this.post(url.PROHIBITED_PIC, params, callback);
    },
    //图片审核和举报管理
    adminReportList: function(params, callback) {
        this.post(url.ADMIN_REPORT_LIST, params, callback);
    },

    adminReview: function(params, callback) {
        this.post(url.ADMIN_REVIEW, params, callback);
    },

    adminReviewList: function(params, callback) {
        this.post(url.ADMIN_REVIEW_LIST, params, callback);
    },

    //推荐关注列表
    listRecommend: function(params, callback) {
        this.post(url.RECOMMEND_LIST, params, callback);
    },
    //新增推荐关注
    addRecommend: function(params, callback) {
        this.post(url.ADMIN_ADD_RECOMMEND, params, callback);
    },
    //更新推荐关注
    modifyRecommend: function(params, callback) {
        this.post(url.ADMIN_MODIFY_RECOMMEND, params, callback);
    },
    //下线推荐关注
    dpwnlineRecommend: function(params, callback) {
        this.post(url.ADMIN_DOWNLINE_RECOMMEND, params, callback);
    },
    //消息撤回和屏蔽
    operateMessage: function(params, callback) {
        this.post(url.OPERAGE_MSG, params, callback);
    },
    //增加专题内容
    addSubjectContent: function(params, callback) {
        this.post(url.ADMIN_ADD_SUBJECT_CONTENT, params, callback);
    },
    // 获取快捷回复标签
    getQuickReplyLabels: function(params, callback) {
        this.post(url.GET_QUICK_REPLY_LABELS, params, callback);
    },

    getGroupSubjectList: function(params, callback) {
        this.post(url.GET_GROUP_SUBJECT_LIST, params, callback);
    },
}

export {service}
