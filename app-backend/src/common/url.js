/*
 * @file 请求url配置
 * @author hualuyao
 */

const url = {

    // 初始化服务
    GET_USER_Account: '/community-manager-war/sso/getUserAccount',
    // sso logout
    GET_SSO_Logout: '/community-manager-war/sso/logout',

    // header-开启|关闭机器人
    MANAGE_ROBOT: '/community-manager-war/server/singleChatManager/manageRobot.action',

    // header-开启|关闭猜你想问
    MANAGE_GUESS_ASK: '/community-manager-war/server/singleChatManager/manageGuessAsk.action',

    /*
     * 内容管理
     */
    // 首页每日一句话和每日活动
    GET_TODAY_MOTTO: '/community-manager-war/banner/getTodayMotto.action',
    ADD_TODAY_MOTTO: '/community-manager-war/banner/addTodayMotto.action',
    UPDATE_TODAY_MOTTO: '/community-manager-war/banner/updateTodayMotto.action',
    GET_ALL_COLLEGE: '/community-manager-war/banner/getAllCollege.action',
    GET_ALL_NATIVE_PAGE: '/community-manager-war/banner/getAllNativePage.action',
    GET_ALL_SKIP_PAGE: '/community-manager-war/messageChannel/getAllSkipPage.action',
    ADMIN_ADD_OPT_INFO: '/community-manager-war/optinfo/adminAddOptInfo.action',
    ADMIN_UPDATE_OPT_INFO: '/community-manager-war/optinfo/adminUpdateOptInfo.action',
    ADMIN_DELETE_OPT_BY_ID: '/community-manager-war/optinfo/adminDeleteOptById.action',
    ADMIN_GET_OPT_INFO_BY_ID: '/community-manager-war/optinfo/adminGetOptInfoById.action',
    ADMIN_UPDATE_STATE_BY_ID: '/community-manager-war/optinfo/adminUpdateStateById.action',
    ADMIN_GET_OPT_LIST_BY_COLLEGE: '/community-manager-war/optinfo/adminGetOptListByCollege.action',
    ADMIN_GET_OPT_LIST: '/community-manager-war/optinfo/adminGetOptList.action',
    ADMIN_GET_FIRST_PROJECT_LIST: '/community-manager-war/server/optinfo/listFirstProject',
    ADMIN_GET_SEC_PROJECT_LIST: '/community-manager-war/teachermessage/listSecProjectByFirstId.action',
    ADMIN_GET_OPERATION_LOG: '/community-manager-war/optinfo/adminGetOperationLog.action',
    LIST_ALL_CORPS: '/community-manager-war/optinfo/listAllCorps.action',
    RECOMMEND_LIST: '/community-manager-war/hotRecommendManager/adminListRecommend.action',
    ADMIN_ADD_RECOMMEND: '/community-manager-war/hotRecommendManager/adminAddRecommend.action',
    ADMIN_MODIFY_RECOMMEND: '/community-manager-war/hotRecommendManager/adminModifyRecommend.action',
    ADMIN_DOWNLINE_RECOMMEND: '/community-manager-war/hotRecommendManager/adminDownlineRecommend',
    ADMIM_GET_HOT_ACT: '/community-manager-war/hotactivity/adminGetHotActivityById.action',
    ADMIN_ADD_HOT_ACT: '/community-manager-war/hotactivity/adminAddHotActivity.action',
    ADMIN_GET_HOT_ACT_LIST: '/community-manager-war/hotactivity/adminGetHotActivityList.action',
    ADMIN_GET_HOT_ACT_OPERATE_LOG: '/community-manager-war/hotactivity/getHotActivityOperationLog.action',
    ADMIN_UPDATE_HOT_ACT: '/community-manager-war/hotactivity/adminUpdateHotActivity.action',
    ADMIN_OFFLINE_HOT_ACT: '/community-manager-war/hotactivity/adminOfflineHotActivity.action',
    ADMIN_DELETE_HOT_ACT: '/community-manager-war/hotactivity/adminDeleteHotActivity.action',
    ADMIM_ADD_SUBJECT: '/community-manager-war/subject/adminAddSubject.action',
    ADMIN_GET_SUBLECT_LIST: '/community-manager-war/subject/adminGetSubjectList.action',
    ADMIN_GET_SUBJECT_BY_ID: '/community-manager-war/subject/adminGetSubjectById.action',
    ADMIN_UPDATE_SUBJECT: '/community-manager-war/subject/adminUpdateSubject.action',
    ADMIN_OFFLINE_SUBJECT: '/community-manager-war/subject/adminOfflineSubject.action',
    ADMIN_ADD_SUBJECT_CONTENT: '/community-manager-war/subject/adminAddSubjectContent.action',
    ADMIN_GET_SUBLECT_CONTENT_LIST: '/community-manager-war/subject/adminGetSubjectContentList.action',
    ADMIN_DELETE_SUBJECT_CONTENT: '/community-manager-war/subject/adminDeleteSubjectContent.action',

    // VIP课程咨询页配置
    GET_ALL_COURSE_VIP: '/community-manager-war/course/getAllCourseVIP.action',
    GET_BRAND_VIP_MODULE_BY_COURSEID: '/community-manager-war/course/getBrandVipModuleByCourseId.action',
    INSERT_BRAND_VIP: '/community-manager-war/course/insertBrandVIP.action',
    UPDATE_BRAND_VIP: '/community-manager-war/course/updateBrandVIP.action',
    INSERT_COURSE_PACKAGE: '/community-manager-war/course/insertCoursePackage.action',
    UPDATE_COURSE_PACKAGE: '/community-manager-war/course/updateCoursePackage.action',
    DELETE_COURSE_PACKAGE: '/community-manager-war/course/deleteCoursePackage.action',
    GET_COURSE_PACKAGE_BY_COURSEID: '/community-manager-war/course/getCoursePackageByCourseId.action',

    // 免费课开课配置
    GET_ALL_FREE_CLASS: '/community-manager-war/user/getAllFreeClass.action',
    DELETE_FREE_CLASS: '/community-manager-war/user/deleteFreeClass.action',
    UPDATE_FREE_CLASS: '/community-manager-war/user/updateFreeClass.action',
    CONFIGURE_FREE_CLASS: '/community-manager-war/user/configureFreeClass.action',

    // 福利活动
    LIST_ANNOUNCEMENT: '/community-manager-war/activity/listAnnouncement.action',
    INSERT_ANNOUNCEMENT: '/community-manager-war/activity/insertAnnouncement.action',
    DELETE_ANNOUNCEMENT: '/community-manager-war/activity/deleteAnnouncement.action',
    UPDATE_ANNOUNCEMENT: '/community-manager-war/activity/updateAnnouncement.action',

    /*
    *精选话题
    */
    GET_SELECTEDTOPICS_LIST_DATA: '/community-manager-war/topic/adminTopicList.action',
    GET_TOPIC_CLASSIFY: '/community-manager-war/topic/getTopicClassify.action',
    GET_ADDSELECTEDTOPICS_DATA: '/community-manager-war/topic/adminAddTopic.action',
    GET_UPDATESELECTEDTOPICS_DATA: '/community-manager-war/topic/adminUpdateTopic.action',
    GET_DISORHIDEITEMS_DATA: '/community-manager-war/topic/adminIsShowTopic.action',
    GET_DELETETOPICINFOITEMS_DATA: '/community-manager-war/topic/adminDeleteTopicById.action',
    // 新增精选话题二期-新增-用户归属-学院列表接口
    GET_SELECTED_COLLEGELIST_DATA: '/community-manager-war/banner/getAllCollege.action',
    // 新增精选话题二期-新增-用户归属-家族列表接口
    GET_SELECTED_FAMILYLIST_DATA: '/community-manager-war/topic/listFamilyByCollegeList.action',
    // 精选话题-新增-更新-校验轮次IdAPI
    NO_ROUND_ID_LIST: '/community-manager-war/topic/noRoundIdList.action',
    // 精选话题-设置分类
    ADMIN_SET_TOPIC_CLASS: '/community-manager-war/topic/adminSetTopicClass.action',
    // 精选话题-获取分类列表
    ADMIN_GET_TOPIC_CLASS: '/community-manager-war/topic/adminGetTopicClass.action',
    ADMIN_EXPORT_TOPIC_LIST: '/community-manager-war/topic/adminExportTopicList.action',

    /*
     *社区管理
     */
    // addAssociateSecProject，notAssociateCollege，notAssociateSecProject，listAlbumOperateLog，adminDelAssociateSecProject，adminListChildAlbumByParentId
    // 一级版块
    CREATE_NEW_PARENT_ALBUM: '/community-manager-war/albumadmin/createNewParentAlbum.action',
    UPDATE_PARENT_ALBUM: '/community-manager-war/albumadmin/updateParentAlbum.action',
    SHOW_ALL_PARENT_ALBUMS: '/community-manager-war/albumadmin/showAllParentAlbums.action',
    NOT_ASSOCIATE_COLLEGE: '/community-manager-war/server/albumadmin/notAssociateCollege.action',
    DEL_PARENT_ALBUM: '/community-manager-war/server/albumadmin/delParentAlbum.action',
    // 二级板块
    CREATE_NEW_CHILD_ALBUM: '/community-manager-war/albumadmin/createNewChildAlbum.action',
    UPDATE_CHILD_ALBUM: '/community-manager-war/albumadmin/updateChildAlbum.action',
    SHOW_ALL_CHILD_ALBUMS: '/community-manager-war/albumadmin/showAllChildAlbums.action',
    GET_CHILDALBUN_BY_PARENTID: '/community-manager-war/server/albumadmin/adminListChildAlbumByParentId.action',
    NOT_ASSOCIATE_SEC_PROJECT: '/community-manager-war/server/albumadmin/notAssociateSecProject.action',
    UPDATE_CHILD_ALBUM_SEC: '/community-manager-war/albumadmin/updateChildAlbum.action',
    DELETE_CHILD_ALBUN_SEC: '/community-manager-war/server/albumadmin/delChildAlbum.action',
    CREATE_CHILD_ALBUM_SEC: '/community-manager-war/albumadmin/createNewChildAlbum.action',
    ADD_ASSOCIATE_SECPROJECT: '/community-manager-war/server/albumadmin/adminAddAssociateSecProject.action',
    DEL_ASSOCIATE_SECPROJECT: '/community-manager-war/server/albumadmin/adminDelAssociateSecProject.action',
    LIST_ALL_COLLEGE_SEC: '/community-manager-war/teachermessage/getAllCollege.action',
    // 版块日志
    LIST_ALBUM_LOG: '/community-manager-war/server/albumadmin/listAlbumOperateLog.action',
    // 版块帖子
    RETRIEVE_POST_LIST_BY_ALBUM_PARENT_ID: '/community-manager-war/post/retrievePostListByAlbumParentId.action',
    RETRIEVE_POST_LIST_BY_ALBUM_CHILD_ID: '/community-manager-war/post/retrievePostListByAlbumChildId.action',
    DELETE_POST_BY_USER_ID: '/community-manager-war/post/deletePostMasterByManager.action',
    /* RECOVER_POST_MASTER: '/community-manager-war/post/recoverPostMaster.action', */
    RECOVER_POST_MASTER: '/community-manager-war/post/recoverPostMaster.action',
    UPDATE_POST_MASTER_TOP: '/community-manager-war/post/updatePostMasterTop.action',
    UPDATE_POST_MASTER_STAR: '/community-manager-war/post/updatePostMasterStar.action',
    UPDATE_POST_MASTER_GLOBAL: '/community-manager-war/post/updatePostMasterGlobal.action',
    RETRIEVE_POST_LIST: '/community-manager-war/post/retrievePostList.action',
    RETRIEVE_SLAVE_POST_LIST: '/community-manager-war/post/retrieveSlavePostList.action',
    UPDATE_POST_MASTER_HIDE_STATE: '/community-manager-war/post/updatePostMasterHideState.action',
    UPDATE_POST_SLAVE_HIDE_STATE: '/community-manager-war/post/updatePostSlaveHideState.action',
    UPDATE_POST_SLAVE_DELETE_FLAG: '/community-manager-war/post/updatePostSlaveDeleteFlag.action',
    RETRIEVE_POST_PURPOSE: '/community-manager-war/post/retrievePostPurpose.action',
    GET_POST_OPERATION_LOG: '/community-manager-war/post/getPostOperationLog.action',
    GET_POST_SLAVE_OPERATION_LOG: '/community-manager-war/post/getPostSlaveOperationLog.action',
    RETRIEVE_MASTER_TYPE_BY_ID: '/community-manager-war/post/retrieveMasterTypeById.action',
    UPDATE_MASTER_TYPE: '/community-manager-war/post/updateMasterType.action',
    UPDATE_POST_MASTER_GLOBAL_TOP: '/community-manager-war/post/updatePostMasterGlobalTop.action',
    SLAVE_POST_DOWNLOAD: '/community-manager-war/post/slavePostDownload.action',
    NORMAL_POST_DOWNLOAD: '/community-manager-war/post/normalPostDownload.action',
    DH_POST_DOWNLOAD: '/community-manager-war/post/dhPostDownload.action',
    TRANSFER_POST_MASTER: '/community-manager-war/post/transferPostMaster.action',
    SHOW_NICK_NAMES: '/community-manager-war/post/showNicknames.action',
    RETRIEVE_POST_REPLY_LIST: '/community-manager-war/post/retrievePostReplyList.action',
    REPLY_POST_DOWNLOAD: '/community-manager-war/post/replyPostDownload.action',
    DH_POST_REPLY_DOWNLOAD: '/community-manager-war/post/dhPostReplyDownload.action',
    DH_POST_SLAVE_DOWNLOAD: '/community-manager-war/post/dhPostSlaveDownload.action',
    UPDATE_POST_REPLY_HIDE_STATE: '/community-manager-war/post/updatePostReplyHideState.action',
    UPDATE_POST_REPLY_DELETE_FLAG: '/community-manager-war/post/updatePostReplyDeleteFlag.action',
    GET_POST_REPLY_OPERATION_LOG: '/community-manager-war/post/getPostReplyOperationLog.action',
    // 图片审核
    LIST_PIC_SUSPECTED: '/community-manager-war/adminPicReview/listPicSuspected.action',
    LIST_PIC_DELETE: '/community-manager-war/adminPicReview/listPicDelete.action',
    PROHIBITED_PIC: '/community-manager-war/adminPicReview/prohibitedPic.action',


    // 权限管理
    ADMIN_BANNED_LIST: '/community-manager-war/permission/adminBannedList.action',
    ADMIN_UPDATE_BANNED: '/community-manager-war/permission/adminUpdateBanned.action',
    ADMIN_SET_BAN_POLICY: '/community-manager-war/server/permission/adminSetBanPolicy',
    ADMIN_GET_BAN_POLICY: '/community-manager-war/server/permission/adminGetBanPolicy',
    ADMIN_DOWNLOAD_BANNED_LIST: '/community-manager-war/permission/adminDownloadBannedList.action',
    CONFIG_PERMISSION_BY_USERID: '/community-manager-war/permission/configPermissionByUserId.action',
    GET_BACKEND_AUTHORITY_BY_USER_ACCOUNT: '/community-manager-war/user/getBackendAuthorityByUserAccount.action',
    ADD_BACKEND_AUTHORITY_BY_USER_ACCOUNT: '/community-manager-war/user/addBackendAuthorityByUserAccount.action',
    CONFIG_BACKEND_AUTHORITY_BY_USER_ACCOUNT: '/community-manager-war/user/configBackendAuthorityByUserAccount.action',
    GET_ROLES_LIST: '/community-manager-war/user/getRolesList.action',
    GET_MENU_LIST_BY_ROLE_ID: '/community-manager-war/user/getMenuListByRoleId.action',
    ADD_ROLE_BY_USER_ACCOUNT: '/community-manager-war/user/addRoleByUserAccount.action',
    CONFIG_ROLE_BY_USER_ACCOUNT: '/community-manager-war/user/configRoleByUserAccount.action',

    GET_CHAT_MESSAGE_LIST: '/community-manager-war/teachermessage/getTeacherChatMessageList.action',
    GET_CHAT_MESSAGES_BY_USER_ID: '/community-manager-war/message/getChatMessagesByUserId.action',
    SEND_MESSAGE_TO_USER_ID: '/community-manager-war/message/sendMessageToUserId.action',
    SEND_MESSAGE_BY_TEACHER: '/community-manager-war/teachermessage/sendMessageByTeacher.action',
    // GET_CHAT_MESSAGES_BY_TEACHER: '/community-manager-war/teachermessage/getChatMessagesByTeacher.action',
    GET_TEACHER_BY_CONDITION: '/community-manager-war/singleChatManager/getTeacherByCondition.action',
    GET_HISTORY_MSG: '/community-manager-war/singleChatManager/getHistoryMsg.action',
    MODIFY_MESSAGE_TOP: '/community-manager-war/teachermessage/modifyMessageTop.action',

    // 获取聊天对象详细信息
    GET_CHAT_USER_DETAIL: '/community-manager-war/message/getChatUserDetail.action',

    // 搜索用户真实姓名
    GET_MESSAGE_ADMIN_SEARCH_USER: '/community-manager-war/albumadmin/getMessageAdminSearchUser.action',

    // PC社区广告
    ADD_PC_SOCIAL_AD: '/community-manager-war/adver/addPcSocialAd.action',
    GET_PC_SOCIAL_AD: '/community-manager-war/adver/getPcSocialAd.action',
    UPDATE_PC_SOCIAL_AD: '/community-manager-war/adver/updatePcSocialAd.action',
    DELETE_PC_SOCIAL_AD: '/community-manager-war/adver/deletePcSocialAd.action',
    GET_OPERATION_LOG: '/community-manager-war/sysLog/getOperationLog.action', // 查看操作日志

    // 聊天记录
    GET_HISTORY_CHAT_MESSAGE_LIST: '/community-manager-war/teachermessage/getHistoryChatMessageList.action',

    // 获取班主任的学员列表
    GET_STUDENTS_LIST: '/community-manager-war/teachermessage/getStudentsList.action',

    // 获取学员信息
    GET_STUDENT_DETAIL: '/community-manager-war/teachermessage/getStudentDetail.action',

    // 获取班主任与该学员是否为代班关系
    GET_RELATION_BY_STU: '/community-manager-war/teachermessage/getRelationByStu.action',

    // 提交编辑的学员备注信息
    EDIT_STUDENT_DESC: '/community-manager-war/teachermessage/editStudentDesc.action',

    /*
     * 快捷回复
     */
    // 获取快捷回复列表
    GET_COMMON_PHRASE_LIST: '/community-manager-war/teachermessage/getAllQuickReplys.action',

    // 添加快捷回复
    ADD_COMMON_PHRASE: '/community-manager-war/teachermessage/addQuickReply.action',

    // 修改快捷回复
    EDIT_COMMON_PHRASE: '/community-manager-war/teachermessage/editQuickReply.action',

    // 删除快捷回复
    DELETE_COMMON_PHRASE: '/community-manager-war/teachermessage/deleteQuickReply.action',

    // 移动快捷回复位置
    MOVE_COMMON_PHRASE_POSITION: '/community-manager-war/teachermessage/moveQuickReply.action',

    // 获取快捷回复标签
    GET_QUICK_REPLY_LABELS: '/community-manager-war/teachermessage/getQuickReplyLabels.action',

    // 添加快捷回复左侧标签addQuickReplyLabel
    ADD_QUICK_REPLY_LABEL: '/community-manager-war/server/teachermessage/addQuickReplyLabel.action',

    // 重命名快捷回复左侧标签updateQuickReplyLabel
    UPDATE_QUICK_REPLY_LABEL: '/community-manager-war/server/teachermessage/updateQuickReplyLabel.action',

    // 删除快捷回复左侧标签delQuickReplyLabel
    DELETE_QUICK_REPLY_LABEL: '/community-manager-war/server/teachermessage/delQuickReplyLabel.action',

    // 快捷回复置顶topQuickReply
    TOP_QUICK_REPLY: '/community-manager-war/server/teachermessage/topQuickReply.action',

    // 快捷回复点击发送的次数countQuickReply
    COUNT_QUICK_REPLY: '/community-manager-war/server/teachermessage/countQuickReply.action',


    // 智能搜索

    // 获取老师全部快捷回复接口
    ADMIN_GETALLQUICKREPLYS: '/community-manager-war/server/teachermessage/adminGetAllQuickReplys.action',

    // 添加获取客诉单的接口adminGetOrdDetailNo
    ADMIN_GETORD_DETAILNO: '/community-manager-war/server/teachermessage/adminGetOrdDetailNo.action',


    // 获取 数据统计 数据
    GET_STATISTIC_DATA: '/community-manager-war/message/getStatMessage.action',

    // 图标管理-查询接口
    ADMIN_GET_ICON_LIST: '/community-manager-war/icon/adminGetIconList.action',

    // 图标管理-新增
    ADMIN_ADD_ICON: '/community-manager-war/icon/adminAddIcon.action',

    // 图标管理-新增变更-图标名称列表
    ADMIN_RETRIEVE_ALL_BUTTON: '/community-manager-war/icon/adminRetrieveAllButton.action',

    // 图标管理-更新
    ADMIN_UPDATE_ICON: '/community-manager-war/icon/adminUpdateIcon.action',

    // 图标管理-删除
    DELETE_ICON_BY_ID: '/community-manager-war/icon/deleteIconById.action',

    // 图标管理-下线
    ADMIN_UPDATE_ICON_STATE_BY_ID: '/community-manager-war/icon/adminUpdateIconStateById.action',


    // 获取 首页热帖-推荐 数据
    GET_HOTPOSTSREC_DATA: '/community-manager-war/getpost/showAllSuggestedPosts.action',
    // 获取 首页热帖-屏蔽 数据
    GET_HOTPOSTSSHIELD_DATA: '/community-manager-war/getpost/showAllBlockedPosts.action',
    // 首页热帖-新增
    GET_ADDPOSTS_PIC: '/community-manager-war/getpost/createNewSuggestedPost.action',
    // 获取 首页热帖-查看 数据
    VIEW_CHECK_LOG: '/community-manager-war/getpost/getPostSuggestOperationLog.action',
    // 获取 首页热帖-更新 数据
    UPDATE_HOT_POSTS: '/community-manager-war/getpost/updateSuggestedPost.action',
    // vip学员推荐
    ADMIN_UPDATE_SUGGEST_STATE: '/community-manager-war/getpost/adminUpdateSuggestState.action',
    // 新增||更新 家族列表
    LIST_FAMILY_BY_COLLEGES: '/community-manager-war/topic/listFamilyByColleges.action',
    // 首页热帖-新增屏蔽
    GET_ADDSHIELD_DATA: '/community-manager-war/getpost/createNewBlockedPost.action',
    // 首页热帖-屏蔽-取消屏蔽|屏蔽
    GET_SHIELDHOTPOSTS_DATA: '/community-manager-war/getpost/updateBlockedPost.action',
    // 推荐热帖-话题名称-下拉框API
    GET_TOPICNAME_LIST_DATA: '/community-manager-war/topic/adminGetTopicName.action',

    // 推荐热帖-非付费学员-查询-API
    GET_UNPAYED_DATA: '/community-manager-war/getpost/getUnPaidHotMasterPosts.action',
    // 推荐热帖-变更展示规则
    SET_UNPAID_SUGGESTED_POST: '/community-manager-war/getpost/setUnPaidSuggestedPost.action',
    // 推荐热帖-非付费学员推荐-推荐设置API
    UPDATE_UNPAID_HOST_SHOWSCOPE: '/community-manager-war/server/getpost/updateUnPaidHotShowScope.action',
    // 推荐热帖-非付费学员推荐-删除API
    DELETE_NEW_UNPAYED_HOT_MASTER_POSTS: '/community-manager-war/getpost/deleteNewUnPaidHotMasterPosts.action',
    // 推荐热帖-非付费学员推荐-新增API
    ADD_NEW_UNPAYED_HOT_MASTER_POST: '/community-manager-war/getpost/addNewUnPaidHotMasterPost.action',
    // 推荐热帖-非付费学员推荐-批量新增API
    ADD_NEW_UNPAYED_HOT_MASTER_POSTS: '/community-manager-war/getpost/addNewUnPaidHotMasterPosts.action',
    // //推荐热帖-非付费学员推荐-上传文件
    // GETPOSTUPLOAD_UNPAYED_HOT_MASTER_POST_FILE: '/community-manager-war/getpost/getpostuploadUnPaidHotMasterPostFile.action',
    // 推荐热帖-非付费学员推荐-上传文件
    UPLOAD_UNPAYED_HOT_MASTER_POST_FILE: '/community-manager-war/base/uploadUnPaidHotMasterPostFile.action',


    /* *群发消息 */
    // 获取老师所有班型的名称
    GET_TEACHER_PACKAGE_NAMES: '/community-manager-war/groupmessage/getTeacherPackageNames.action',
    // 获取群发消息左侧用户列表
    GET_GROUP_STUDENTS_LIST: '/community-manager-war/groupmessage/getGroupStudentsList.action',
    // 发送群组消息
    CREATE_TEACHER_GROUP_BATCH: '/community-manager-war/messageChannel/createTeacherGroupBatch.action',
    // 获取群发消息列表
    GET_GROUP_CHAT_MESSAGE_LIST: '/community-manager-war/groupmessage/getGroupChatMessageList.action',
    // 获取群发消息详细信息
    GET_GROUP_CHAT_BY_MESSAGE_ID: '/community-manager-war/groupmessage/getGroupChatByMessageId.action',
    // 群发失败消息重发
    SEND_FAIL_GROUP_MESSAGE: '/community-manager-war/groupmessage/sendFailGroupMessage.action',

    // 发送服务评价
    SEND_EVALUATION_BY_TEACHER: '/community-manager-war/teachermessage/sendEvaluationByTeacher.action',

    // 获取所有省份
    GET_ALL_PROVINCES: '/community-manager-war/groupmessage/getAllProvinces.action',

    // 上传普通文件路径
    UPLOAD_COMMON_FILE: '/community-manager-war/base/uploadCommonFile.action',
    UPLOAD_PIC: '/community-manager-war/base/uploadPicture.action',
    UPLOAD_PIC_REAL_SIZE: '/community-manager-war/base/uploadPic.action',
    UPLOAD_AUDIO_FILE: '/community-manager-war/base/uploadAudioFile.action',
    UPLOAD_VIDEO_FILE: '/community-manager-war/base/uploadVideoFile.action',
    UPLOAD_GIF: '/community-manager-war/base/uploadGif.action',

    // 自动回复话术配置
    GET_ALL_AUTO_REPLYS: '/community-manager-war/teachermessage/getAllAutoReplys.action',
    EDIT_AUTO_REPLY: '/community-manager-war/teachermessage/editAutoReply.action',
    DEL_AUTO_REPLY: '/community-manager-war/teachermessage/delAutoReply.action',
    VIEW_AUTO_REPLY_LOG: '/community-manager-war/teachermessage/viewAutoReplyLog.action',

    // 代班设置
    GET_COVER_TEACHER_LIST: '/community-manager-war/teachermessage/getCoverTeacherList.action',
    SET_COVER_TEACHER: '/community-manager-war/teachermessage/setCoverTeacher.action',
    UPDATE_COVER_TEACHER: '/community-manager-war/teachermessage/updateCoverTeacher.action',
    DEL_COVER_TEACHER: '/community-manager-war/teachermessage/delCoverTeacher.action',

    // 敏感词
    GET_ALL_SENSITIVE_DICTIONARY: '/community-manager-war/post/findSensitiveWord.action', // '/community-manager-war/post/getAllSensitiveDictionary.action',
    GET_ALL_SENSITIVE_WORD: '/community-manager-war/post/getAllSensitiveWord.action',
    GET_ALL_SENSITIVE_TYPE: '/community-manager-war/post/getAllSensitiveType.action',
    ADD_SENSITIVE_TYPE: '/community-manager-war/post/addSensitiveType.action',
    UPDATE_SENSITIVE_TYPE: '/community-manager-war/post/updateSensitiveType.action',
    DELETE_SENSITIVE_TYPE: '/community-manager-war/post/deleteSensitiveType.action',
    ADD_SENSITIVE_WORD: '/community-manager-war/post/addSensitiveWord.action',
    UPDATE_SENSITIVE_WORD: '/community-manager-war/post/updateSensitiveWord.action',

    // 值班老师查看学员详细信息
    GET_STUDENT_INFO: '/community-manager-war/teachermessage/getStudentInfo.action',
    EDIT_STUDENT_BY_ON_DUTY_TEACHER: '/community-manager-war/teachermessage/editStudentByOnDutyTeacher.action',

    DELETE_SENSITIVE_WORD: '/community-manager-war/post/deleteSensitiveWord.action',

    // 值班老师
    LIST_ON_DUTY_TEACHER: '/community-manager-war/teachermessage/listOnDutyTeacher.action',
    ADD_ON_DUTY_TEACHER: '/community-manager-war/teachermessage/addOnDutyTeacher.action',
    UPDATE_ON_DUTY_TEACHER: '/community-manager-war/teachermessage/updateOnDutyTeacher.action',
    DELETE_ON_DUTY_TEACHER: '/community-manager-war/teachermessage/deleteOnDutyTeacher.action',

    // 欢迎语
    LIST_WELCOMES: '/community-manager-war/teachermessage/listWelcomes.action',
    ADD_WELCOME_MESSAGE: '/community-manager-war/teachermessage/addWelcomeMessage.action',
    UPDATE_WELCOME_MESSAGE: '/community-manager-war/teachermessage/updateWelcomeMessage.action',
    DELETE_WELCOME_MESSAGE: '/community-manager-war/teachermessage/deleteWelcomeMessage.action',

    // 获取学院和家族
    LIST_FAMILY_BY_COLLEGE: '/community-manager-war/teachermessage/listFamilyByCollege.action',
    LIST_ALL_COLLEGE: '/community-manager-war/teachermessage/listAllCollege.action',
    LIST_ALL_FAMILY: '/community-manager-war/teachermessage/listAllFamily.action',

    // 值班老师状态
    GET_TEACHER_STATUS: '/community-manager-war/teachermessage/getTeacherStatus.action',
    UPDATE_TEACHER_STATUS: '/community-manager-war/teachermessage/updateTeacherStatus.action',
    GET_HISTORY_ON_DUTY_MESSAGE_LIST: '/community-manager-war/teachermessage/getHistoryOnDutyMessageList.action',
    LIST_RECORD_BY_DUTY_TEACHER: '/community-manager-war/teachermessage/listRecordByDutyTeacher.action',
    LIST_LABELS_DUTY_TEACHER: '/community-manager-war/teachermessage/listLabelsDutyteacher.action',

    // 精选话题
    ADMIN_SET_TOPIC_ON_POST: '/community-manager-war/topic/adminSetTopicOnPost.action',
    ADMIN_TOPIC_LIST: '/community-manager-war/topic/adminTopicList.action',
    ADMIN_SEARCH_TOPIC_NAME: '/community-manager-war/server/topic/adminSearchTopicName.action',
    ADMIN_GET_TOPIC_NAME: '/community-manager-war/topic/adminGetTopicName.action',
    ADMIN_EDIT_TOPIC_ON_POST: '/community-manager-war/topic/adminEditTopicOnPost.action',

    // 用户成长体系
    LIST_SUNLAND_AMOUNT_RECORD: '/community-manager-war/product/listSunlandAmountRecord.action',
    ADD_SUNLAND_AMOUNT: '/community-manager-war/product/addSunlandAmount.action',
    LIST_PRODUCT_CATEGORY: '/community-manager-war/product/listProductCategory.action',
    LIST_PRODUCT_BY_MANAGE: '/community-manager-war/product/listProductByManage.action',
    GET_PRODUCT_SELL_PEOPLE: '/community-manager-war/product/getProductSellPeople.action',
    ADD_PRODUCT: '/community-manager-war/product/addProduct.action',
    UPDATE_PRODUCT: '/community-manager-war/product/updateProduct.action',
    CHECK_USER_EXIST: '/community-manager-war/product/checkUserExist.action',

    // 信息通道
    LIST_GROUP_BATCH: '/community-manager-war/messageChannel/listGroupBatch.action',
    EXPORT_GROUP_BATCHS: '/community-manager-war/messageChannel/exportGroupBatchs.action',
    ADD_GROUP_BATCH: '/community-manager-war/messageChannel/addGroupBatch.action',
    ADD_TEACHER_GROUP_BATCH: '/community-manager-war/messageChannel/addTeacherGroupBatch.action',
    DELETE_GROUP_BATCH: '/community-manager-war/messageChannel/deleteGroupBatch.action',
    LIST_NOTIFY_FILE: '/community-manager-war/messageChannel/listNotifyFile.action',
    DELETE_GROUP_MESSAGE_FILE: '/community-manager-war/messageChannel/deleteGroupMessageFile.action',
    LIST_GROUP_MESSAGE_FILE: '/community-manager-war/messageChannel/listGroupMessageFile.action',
    UPLOAD_NOTIFY_FILE: '/community-manager-war/base/uploadNotifyFile.action',
    UPLOAD_GROUP_MESSAGE_FILE: '/community-manager-war/base/uploadGroupMessageFile.action',
    DELETE_NOTIFY_FILE: '/community-manager-war/messageChannel/deleteNotifyFile.action',
    GET_NOTIFY_COUNT: '/community-manager-war/messageChannel/getNotifyCount.action',
    EXPORT_GROUP_EXCEL: '/community-manager-war/messageChannel/exportGroupExcel.action',
    GET_FILE_DETAIL: '/community-manager-war/messageChannel/getFileDetail.action',
    GET_ALL_MESSAGE_TYPE: '/community-manager-war/messageChannel/getAllMessageType.action',
    GET_GROUP_BATCH: '/community-manager-war/messageChannel/getGroupBatch.action',
    ADD_NOTIFY_POPUP: '/community-manager-war/messageChannel/addNotifyPopup.action',
    MODIFY_NOTIFY_POPUP: '/community-manager-war/messageChannel/modifyNotifyPopup.action',
    GET_NOTIFY_POPUP: '/community-manager-war/messageChannel/getNotifyPopup.action',
    GET_PERS_BY_ROLE: '/community-manager-war/messageChannel/getPersByRole.action',
    GET_GROUP_MESSAGE_FILE_DETAIL: '/community-manager-war/messageChannel/getGroupMessageFileDetail.action',
    ADD_GROUP_MESSAGE: '/community-manager-war/messageChannel/addGroupMessage.action',


    // 群聊部分
    GET_GROUP_DETAILS: '/community-manager-war/groupchatManager/getGroupDetails.action',
    UPDATE_GROUP_DETAILS: '/community-manager-war/groupchatManager/updateGroupDetails.action',
    GET_GROUP_STATUS: '/community-manager-war/groupchatManager/getGroupStatus.action',
    UPDATE_GROUP_STATE: '/community-manager-war/groupchatManager/updateGroupState.action',
    LIST_GROUP_MEMBERS: '/community-manager-war/groupchatManager/listGroupMembers.action',
    FORBIDDEN_USER: '/community-manager-war/groupchatManager/forbiddenUser.action',
    DELETE_USER: '/community-manager-war/groupchatManager/deleteUser.action',
    SET_CADRE_USER: '/community-manager-war/groupchatManager/setCadreUser.action',
    ADD_NEW_MEMBERS: '/community-manager-war/groupchatManager/addNewMembers.action',
    GET_GROUP_MESSAGE_LIST: '/community-manager-war/groupchatManager/getGroupMessageList.action',
    GET_HISTORY_GROUP_MESSAGES: '/community-manager-war/groupchatManager/getHistoryGroupMessages.action',
    GET_ALL_GROUP_MESSAGE_LIST: '/community-manager-war/groupchatManager/getAllGroupMessageList.action',
    GET_GROUP_MEMBER_INFO: '/community-manager-war/groupchatManager/getStudentDetail.action',
    UPLOAD_GROUP_NAME_FILE: '/community-manager-war/base/uploadGroupNameFile.action',
    INSERT_GROUP_TALK: '/community-manager-war/groupchatManager/insertGroupTalk.action',
    DELETE_GROUP: '/community-manager-war/groupchatManager/deleteGroup.action',
    TRANSFER_GROUP_MANAGER: '/community-manager-war/groupchatManager/transferGroupManager.action',
    LIST_GROUP_TEACHER: '/community-manager-war/groupchatManager/listGroupTeacher.action',
    GET_GROUP_ANNOUNCE: '/community-manager-war/groupchatManager/getGroupAnnounce.action',
    UPDATE_GROUP_ANNOUNCE: '/community-manager-war/groupchatManager/updateGroupAnnounce.action',
    DELETE_GROUP_ANNOUNCE: '/community-manager-war/groupchatManager/deleteGroupAnnounce.action',
    GET_IM_ID_BY_ACCOUNT: '/community-manager-war/groupchatManager/getImIdByAccount.action',
    OPERAGE_MSG: '/community-manager-war/groupchatManager/operateMessage.action',

    // 审核部分
    GET_CONFIG_APP_VERSION: '/community-manager-war/public/getConfigAppVersion.action',
    SET_CONFIG_APP_VERSION: '/community-manager-war/public/setConfigAppVersion.action',
    GET_APP_KEYS: '/community-manager-war/public/getAppKeys.action',

    // 学员问答
    ADMIN_QUESTION_LIST: '/community-manager-war/question/adminQuestionList.action',
    ADMIN_GET_QUESTION_BY_ID: '/community-manager-war/question/adminGetQuestionById.action',
    ADMIN_REPLY_QUESTION: '/community-manager-war/question/adminReplyQuestion.action',
    ADMIN_UPDATE_QUESTION_STATE: '/community-manager-war/question/adminUpdateQuestionState.action',
    ADMIN_ANSWER_LIST: '/community-manager-war/question/adminAnswerList.action',
    ADMIN_SET_HOT_ANSWER: '/community-manager-war/question/adminSetHotAnswer.action',
    ADMIN_GET_ANSWER_BY_ID: '/community-manager-war/question/adminGetAnswerById.action',
    ADMIN_UPDATE_ANSWER_STATE: '/community-manager-war/question/adminUpdateAnswerState.action',

    // IM单通道
    GET_MY_STUDENT: '/community-manager-war/singleChatManager/getMyStudent.action',
    GET_ORDER_DETAIL_BY_ID: '/community-manager-war/singleChatManager/getOrderDetailById.action',
    GET_TEACHER_OFF_OR_ON_STATUS: '/community-manager-war/singleChatManager/getTeacherOffOrOnStatus.action',
    GET_TEACHER_IMG_URL: '/community-manager-war/singleChatManager/getTeacherImgUrl.action',
    GET_COMMUNICATION_RECORD: ' /community-manager-war/singleChatManager/getCommunicationRecordUrl.action',

    // 图片审核和举报管理
    ADMIN_REPORT_LIST: '/community-manager-war/reportManager/adminReportList.action',
    ADMIN_REVIEW: '/community-manager-war/reportManager/adminReview.action',
    ADMIN_REVIEW_LIST: '/community-manager-war/reportManager/adminReviewList.action',
    // 创建群聊 科目列表
    GET_GROUP_SUBJECT_LIST: '/community-manager-war/server/groupchatManager/querySubjectsByName',
}
export { url }
