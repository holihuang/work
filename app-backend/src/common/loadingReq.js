const baseReq = '/community-manager-war';

const loadingReq = [
    //帖子部分
    `${baseReq}/post/retrievePostList.action`,
    `${baseReq}/post/retrieveSlavePostList.action`,

    `${baseReq}/post/recoverPostMasterByManager.action`,
    `${baseReq}/post/updatePostMasterHideState.action`,

    //首页活动
    `${baseReq}/banner/getTodayMotto.action`,

    //一级版块
    `${baseReq}/albumadmin/showAllParentAlbums.action`,

    //二级版块
    `${baseReq}/albumadmin/showAllChildAlbums.action`,

    //系统自动回复话术配置
    `${baseReq}/teachermessage/getAllAutoReplys.action`,

    //免费课
    `${baseReq}/user/getAllFreeClass.action`,

    //vip课程
    `${baseReq}/course/getAllCourseVIP.action`,

    //获取值班老师列表
    `${baseReq}/teachermessage/listOnDutyTeacher.action`,
    //欢迎语
    `${baseReq}/teachermessage/listWelcomes.action`,
    //精选话题
    //`${baseReq}/topics/adminTopicList.action`

    //用户成长体系
    `${baseReq}/product/listProductByManage.action`,
    `${baseReq}/product/listSunlandAmountRecord.action`,

    //信息通道
    `${baseReq}/messageChannel/getFileDetail.action`,
    `${baseReq}/messageChannel/listGroupBatch.action`,
    `${baseReq}/messageChannel/listNotifyFile.action`,

    //发起群聊
    `${baseReq}/groupchatManager/insertGroupTalk.action`,

    //千人千面
    `${baseReq}/optinfo/adminGetOptListByCollege.action`,
    `${baseReq}/optinfo/adminGetOptList.action`,

    //问答
    `${baseReq}/question/adminQuestionList.action`,
    `${baseReq}/question/adminGetQuestionById.action`,
    `${baseReq}/question/adminAnswerList.action`,
    `${baseReq}/question/adminGetQuestionById.action`,
    `${baseReq}/question/adminGetAnswerById.action`,

    //老师在线离线状态
    `${baseReq}/singleChatManager/getTeacherOffOrOnStatus.action`,
]

export {loadingReq}
