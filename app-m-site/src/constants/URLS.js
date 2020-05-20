let learnGroupShareUrl = ''
if (process.env.NODE_ENV === "dev") {
    learnGroupShareUrl = 'http://172.16.28.248:8991/index.html#/learnGroupRank'
} else if (process.env.NODE_ENV === "test") {
    learnGroupShareUrl ='http://172.16.140.50:8001/community-pc-war/m/index.html#/learnGroupRank'
} else if (process.env.NODE_ENV === "production") {
    learnGroupShareUrl ='http://luntan.sunlands.com/community-pc-war/m/index.html#/learnGroupRank'
}
const URLS = {
    //获取话题下的帖子列表
    GET_POST_BY_TOPIC_URL: '/community-luntan-war/post/getPostByTopic.action',
    //根据群发批次获取详情
    GET_GROUP_BATCH_URL: '/community-luntan-war/messageChannel/getGroupBatch.action',
    GET_TEACHER_MSG_DETAIL_URL: '/community-luntan-war/teachermessage/getTeacherMsgDetail.action',
    GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_URL: '/community-luntan-war/public/getSysMsgDetailBySysMsgId.action',
    //获取帖子详情
    GET_POST_DETAIL_URL: '/community-luntan-war/post/retrievePostSlaveByMasterId.action',
    //
    GET_PRAISE_LIST_URL: '/community-luntan-war/post/postMasterPraiseUserList.action',

    //获取问答详情
    GET_QUESTION_LIST_URL: '/community-luntan-war/question/retrieveQuestionById.action',
    //获取分享回答详情
    GET_ANSWER_LIST_URL: '/community-luntan-war/question/retrieveAnswerById.action',

    VIDEO_DETAIL_URL: '/community-luntan-war/video/videoDetail.action',
    GET_SUGGESTED_VIDEO_LIST_URL: '/community-luntan-war/video/getSuggestedVideoList.action',

    GET_SUBJECT_DETAIL_URL: '/community-luntan-war/subject/getSubjectDetail.action',
    GET_POST_BY_SUBJECT_URL: '/community-luntan-war/subject/getSubjectDetailOfPostList.action',

    GET_APP_MAJOR_INFO_LIST_URL: '/community-luntan-war/applesson/getAppMajorInfoList.action',
    GET_MAJOR_OTHER_INFO_URL: '/community-luntan-war/applesson/getMajorOtherInfo.action',
    GET_SCHOOL_INTRO_URL: '/community-luntan-war/applesson/getSchoolIntruction.action',
    GET_ALL_COURSE_LIST_URL: '/community-luntan-war/applesson/getAllCourseList.action',
    GET_POST_BY_MAJOR_URL: '/community-luntan-war/applesson/getPostByMajorIds.action',
    GET_GOOD_POST_CONTENT_URL: '/community-luntan-war/post/getGoodPostContent.action',
    GET_WX_LOGIN_URL: '/community-luntan-war/post/urlCheck.action',
    UPDATE_FORWARD_CNT_URL: '/community-luntan-war/post/updateForwardCnt.action',
    // get userInfo from wechat
    GET_USER_INFO_IN_WECHAT_URL: '/community-luntan-war/post/getUserByTicket.action',
    // sideEffect
    GET_PUBLISHED_POST_URL: '/community-luntan-war/post/getPublishedPost.action',
    GET_USER_INFO_FROM_EMPLOYEE_APP_URL: '/community-luntan-war/post/getUserInfo.action',
    GET_WX_JS_SIGN_URL: '/community-luntan-war/post/getWxJsSign.action',
    // readRecord
    WEIXIN_RECORD_LIST_URL: '/community-luntan-war/post/weiXinRecordList.action',
    // userCenter
    PERSON_CENTER_RETRIVE_URL: '/community-luntan-war/post/personCenterRetrive.action',
    RECORD_SWITCHER_MANAGER_URL: '/community-luntan-war/post/recordSwitcherManager.action',
    ADD_WEI_XIN_READ_CORD_URL: '/community-luntan-war/post/addWeiXinReadcord.action',
    // personalProfile
    GET_USER_PROFILE_URL: '/community-luntan-war/post/getUserProfile.action',
    QUERY_TAG_URL: '/community-luntan-war/post/queryTag.action',
    UPDATE_TAG_INFO_URL: '/community-luntan-war/post/updateTagInfo.action',
    GET_MY_POST_LIST_URL: '/community-luntan-war/post/getMyPostList.action',
    // 获取学习小组排行数据
    GET_STUDY_QUICK_RANK_LIST: '/community-luntan-war/groupRank/studyQuickRankList.action',
    learnGroupShareUrl,
    GET_SHORT_URL: '/community-luntan-war/post/getShortUrl.action',
    DO_AUTH_FOR_SKY_NET_URL: '/community-luntan-war/post/doAuthForSkyNet.action',
    // 待审核帖子列表
    GET_NEED_TO_SHIEDL_LIST_URL: '/community-luntan-war/postAudit/getAuditPostList.action',
    // 屏蔽帖子
    SET_INVATATION_SHIELD_URL: '/community-luntan-war/postAudit/doHideForPost.action',
    // 通过token 换取用户信息
    GET_USERINFO_BY_TOKEN_URL: '/community-luntan-war/post/getUserInfo.action',
    // 批量审核通过帖子（新增）
    DO_BATCH_AUDIT_FOR_POST_URL: '/community-luntan-war/postAudit/doBatchAuditForPost.action',
    // 微信绑定引导页二维码
    GET_QR_CODE_URL: '/community-luntan-war/public/getQRCodeUrl.action',
    // 微信绑定/解绑
    MANAGE_BIND_263_URL: '/community-luntan-war/post/manageBind263.action',
    // ticket换openId
    ON_GET_USER_BY_TICKET_URL: '/community-luntan-war/user/getUserByTicket.action',
    // 验证码
    SEND_VLD_CODE_URL: '/community-luntan-war/post/sendVldCode.action',
    // 更新个人名片
    UPDATE_PROFILE_URL: '/community-luntan-war/post/updateProfile.action',
    // 上传
    UPLOAD_PC_PICTURE_URL: '/community-luntan-war/base/uploadPcPicture.action',
    QUERY_BIND_263_URL: '/community-luntan-war/post/queryBind263.action',
    // 图片上传-慎用-这个接口没过图片审核(当前只用于上传二维码)
    UPLOAD_QR_CODE_URL: '/community-luntan-war/base/uploadQrCode.action',
    // h5 - 获取学员爱心信息
    GET_SUT_DIND_NESS_URL: '/community-luntan-war/commonweal/getStuKindness.action',
    // h5 - 爱心捐赠项目列表
    GET_PROJECT_LIST_URL: '/community-luntan-war/commonweal/getProjectList.action',
    // h5 - 我的捐赠排行
    GET_MY_DONATION_RANK_URL: '/community-luntan-war/commonweal/getMyDonationRank.action',
    // h5 - 捐赠排行榜
    GET_DONATION_RANK_URL: '/community-luntan-war/commonweal/getDonationRank.action',
    // h5 - 兑换爱心
    EXCHANGE_KINDNESS_URL: '/community-luntan-war/commonweal/exchangeKindness.action',
    // h5 - 获取公益项目信息 (包含预览)
    GET_PROJECT_DETAIL_URL: '/community-luntan-war/commonweal/getProjectDetail.action',
    // h5 - 捐赠爱心
    DONATE_KINDNESS_URL: '/community-luntan-war/commonweal/donateKindness.action',
    // 任务列表
    GET_STU_TASKS_URL: '/community-luntan-war/exam04/getStuTasks.action',
    // 答题兑换信息
    GET_TIKU_INFO_URL: '/community-luntan-war/exam04/getTikuInfo.action',
    // 答题兑换
    DO_TASK_URL: '/community-luntan-war/exam04/doTask.action',
    // 视频列表
    VIDEO_LIST_URL: '/community-luntan-war/exam04/videoList.action',
    // 观看视频
    RECORD_WATCH_URL: '/community-luntan-war/exam04/recordWatch.action',


    // 获取活动时间
    GET_ACTIVITY_INFO: '/community-luntan-war/exam04/getActivityInfo.action',
    // 获取学员卡片信息
    GET_STU_CARDS: '/community-luntan-war/exam04/getStuCards.action',
    // 获取学员某张卡片列表
    GET_STU_CARDS_BY_TAG: '/community-luntan-war/exam04/getStuCardsByTag.action',
    // 抽卡
    GET_CARD: '/community-luntan-war/exam04/getCard.action',
    // 学员抽奖卡片次数
    GET_CARD_CNT: '/community-luntan-war/exam04/getCardCnt.action',
    // 合成卡片
    SYNTHESIZE: '/community-luntan-war/exam04/synthesize.action',
    // 开奖
    GET_RESULT: '/community-luntan-war/exam04/getResult.action',
    // 查询绑定的微信账号
    GET_WEIXIN_ACCOUNT: '/community-luntan-war/exam04/getWeixinAccount.action',
    // 绑定微信账号
    BIND_WECHAT: '/community-luntan-war/exam04/bindWechat.action',
    // 提现接口
    WITHDRAW: '/community-luntan-war/exam04/withdraw.action',

}

export default URLS;
