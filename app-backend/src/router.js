import Backbone from 'backbone'
import { Header } from './common/header/index'
import { SitemapHost } from './common/sitemapHost/SitemapHost'
import { common } from './common/common'

import { chatInfoModelUtil } from './messageManage/conversation/chatInfo'

// 提到这里是考虑到不影响sitemapHost的渲染（依赖hash）
// 自适应补充hash: 如果是老师，需要查询老师状态
const { userRole } = common.getUserInfo()
if (userRole.indexOf('SCH_DUTYTEACHER') !== -1) {
    // 如果是值班老师，默认跳转到会话页面
    chatInfoModelUtil.setRole('dutyteacher')

    if (!window.location.hash) {
        window.location.hash = '#dutyTeacherConversation'
    }
} else if (userRole.indexOf('SCH_TEACHER') !== -1) {
    chatInfoModelUtil.setRole('teacher')

    if (!window.location.hash) {
        window.location.hash = '#myConversation'
    }
} else if (userRole.indexOf('SCH_AFTERSALETEACHER') !== -1) {
    chatInfoModelUtil.setRole('afterSaleTeacher')

    if (!window.location.hash) {
        window.location.hash = '#afterSaleTeacherConversation'
    }
}

const header = new Header()
const sitemapHost = new SitemapHost() // eslint-disable-line
const $main = $('#main')
let currentView = null
const Router = Backbone.Router.extend({
    routes: {
        '': 'index', // 默认展示首页每日一句话
        accountAuthority: 'accountAuthority',
        'opt/:infoType': 'opt',
        'opt/:infoType/:listType': 'opt',
        wordEveryDay: 'wordEveryDay',
        activity: 'activity',
        popup: 'popup',
        sysAutoReply: 'sysAutoReply',
        hotPosts: 'hotPosts',
        pcSocialAd: 'pcSocialAd',
        freeCourse: 'freeCourse',
        vipCourse: 'vipCourse',
        bonus: 'bonus',
        'boardPosts/:postType': 'boardPosts', // 帖子类型,为1表示正常帖，为0表示非正常帖
        'userGrowth/:type': 'userGrowth', // 用户成长体系，包括用户管理和尚德元商城管理
        firstBoard: 'firstBoard',
        'firstBoard/:id/:name/:associateCollegeId': 'firstBoardAndCollege',
        secondBoard: 'secondBoard',
        backendAuthority: 'backendAuthority',
        rolesAuthority: 'rolesAuthority',
        historyMessage: 'historyMessage',
        dataStatistic: 'dataStatistic',
        myConversation: 'myConversation',
        dutyTeacherConversation: 'dutyTeacherConversation',
        imStat: 'imStat',
        sensitiveDictionary: 'sensitiveDictionary',
        teacherOnDutyMan: 'teacherOnDutyMan', // 值班老师账号管理
        dutyTeacherHistory: 'dutyTeacherHistory', // 值班老师聊天记录
        welcomeMessage: 'welcomeMessage',
        selectedTopics: 'selectedTopics', // 精选话题
        myGroupTalk: 'myGroupTalk',
        'myGroupTalk/:groupId': 'myGroupTalk',
        groupInitor: 'groupInitor',
        groupMessage: 'groupMessageList',
        // "groupMessage/sender": "createGroupMessageList",
        'groupMessage/import': 'notifyFilesList',
        'groupMessage/importsys': 'notifyFilesListSys',
        'groupMessage/publish/:fileId(/:sendUserType)': 'groupMessagePublish',
        iosReview: 'iosReview',
        questions: 'questions',
        'questions/:questionId': 'questions',
        answers: 'answers',
        'pictureAudit/:type': 'pictureAudit', // 图片审核
        'picReport/:type': 'picReport',
        iconAdmin: 'iconAdmin', // 图标管理
        hotActivity: 'hotActivity',
        publicLesson: 'publicLesson', // 公开课配置
        'publicLesson/:type(/:id)': 'publicLessonEdit', // 公开课配置新增|更新
        subject: 'subject',
        'subjectContent/:subjectId/:subjectName/:allowOperate':
            'subjectContent',
        afterSaleTeacher: 'afterSaleTeacher', // 投退老师
        afterSaleTeacherConversation: 'afterSaleTeacherConversation',
        beforelesson: 'beforelesson', // 体验前置
        'beforelesson/:type(/:id)': 'beforelessonEdit', // 体验前置编辑页
        caseHub: 'caseHub', // 优质案例库
        'caseHub/:type(/:mode/:postid/:caseid)': 'caseHubAdd', // 案例库新增|编辑
        caseHubOper: 'caseHubOper', // 优质案例展示页
        patter: 'patter', // 话术库 - 话术管理
        tag: 'tag', // 话术库 - 标签管理
        storyNotice: 'storyNotice', // 学员故事通知
        commonweal: 'commonweal', // 公益项目
        'commonwealEdit(/:projectId)': 'commonwealEdit', // 公益项目
    },
    index() {
        // $main.html('Welcome!');
    },

    commonweal() {
        common.loading()
        require.ensure(['./contentManage/welfare/index'], require => {
            const {
                Welfare,
            } = require('./contentManage/welfare/index')
            this._switchView(Welfare)
        })
    },

    commonwealEdit(projectId) {
        common.loading()
        require.ensure(['./contentManage/welfare/index'], require => {
            const {
                WelfareEdit,
            } = require('./contentManage/welfare/mod/index')
            this._switchView(WelfareEdit, {
                projectId,
            })
        })
    },

    subjectContent(subjectId, subjectName, allowOperate) {
        common.loading()
        require.ensure(['./contentManage/subjectContent/index'], require => {
            const {
                subjectContent,
            } = require('./contentManage/subjectContent/index')
            this._switchView(subjectContent, {
                subjectId,
                subjectName,
                allowOperate,
            })
        })
    },

    subject() {
        common.loading()
        require.ensure(['./contentManage/subject/index'], require => {
            const { subject } = require('./contentManage/subject/index')
            this._switchView(subject)
        })
    },

    hotActivity() {
        common.loading()
        require.ensure(['./contentManage/hotActivity/index'], require => {
            const { hotActivity } = require('./contentManage/hotActivity/index')
            this._switchView(hotActivity)
        })
    },

    publicLesson(type) {
        common.loading()
        require.ensure(['./publicLesson/index'], require => {
            const { PublicLesson } = require('./publicLesson/index')
            this._switchView(PublicLesson, { type })
        })
    },

    publicLessonEdit(type, id) {
        common.loading()
        require.ensure(['./publicLesson/edit/index'], require => {
            const { PublicLessonEdit } = require('./publicLesson/edit/index')
            this._switchView(PublicLessonEdit, { type, id })
        })
    },

    accountAuthority() {
        common.loading()
        require.ensure(
            ['./authorityManage/accountAuthority/AccountAuthority'],
            require => {
                const {
                    AccountAuthority,
                } = require('./authorityManage/accountAuthority/AccountAuthority')
                this._switchView(AccountAuthority)
            },
        )
    },

    backendAuthority() {
        common.loading()
        require.ensure(
            ['./authorityManage/backendAuthority/index'],
            require => {
                const {
                    BackendAuthority,
                } = require('./authorityManage/backendAuthority/index')
                this._switchView(BackendAuthority)
            },
        )
    },

    rolesAuthority() {
        common.loading()
        require.ensure(['./authorityManage/rolesAuthority/index'], require => {
            const {
                RolesAuthority,
            } = require('./authorityManage/rolesAuthority/index')
            this._switchView(RolesAuthority)
        })
    },

    opt(infoType, listType) {
        common.loading()
        if (!listType || +listType === 1) {
            require.ensure(
                ['./contentManage/opt/contentPage/index'],
                require => {
                    const {
                        Opt,
                    } = require('./contentManage/opt/contentPage/index')
                    this._switchView(Opt, { infoType })
                },
            )
        } else if (+listType === 2) {
            require.ensure(
                ['./contentManage/opt/collegePage/index'],
                require => {
                    const {
                        Opt,
                    } = require('./contentManage/opt/collegePage/index')
                    this._switchView(Opt, { infoType })
                },
            )
        } else {
            // do nothing
        }
    },

    wordEveryDay() {
        common.loading()
        require.ensure(['./contentManage/wordEveryDay/index'], require => {
            const {
                WordEveryDay,
            } = require('./contentManage/wordEveryDay/index')
            this._switchView(WordEveryDay)
        })
    },

    activity() {
        common.loading()
        require.ensure(['./contentManage/activity/index'], require => {
            const { Activity } = require('./contentManage/activity/index')
            this._switchView(Activity)
        })
    },

    iconAdmin() {
        common.loading()
        require.ensure(['./contentManage/iconAdmin/index'], require => {
            const { IconAdmin } = require('./contentManage/iconAdmin/index')
            this._switchView(IconAdmin)
        })
    },

    popup() {
        common.loading()
        require.ensure(['./contentManage/popup/index'], require => {
            const { Popup } = require('./contentManage/popup/index')
            this._switchView(Popup)
        })
    },

    sysAutoReply() {
        common.loading()
        require.ensure(['./contentManage/sysAutoReply/index'], require => {
            const {
                SysAutoReply,
            } = require('./contentManage/sysAutoReply/index')
            this._switchView(SysAutoReply)
        })
    },

    hotPosts() {
        common.loading()
        require.ensure(['./contentManage/hotPosts/index'], require => {
            const { HotPosts } = require('./contentManage/hotPosts/index')
            this._switchView(HotPosts)
        })
    },

    pcSocialAd() {
        common.loading()
        require.ensure(['./contentManage/pcSocialAd/index'], require => {
            const { PcSocialAd } = require('./contentManage/pcSocialAd/index')
            this._switchView(PcSocialAd)
        })
    },

    freeCourse() {
        common.loading()
        require.ensure(['./contentManage/freeCourse/index'], require => {
            const { FreeCourse } = require('./contentManage/freeCourse/index')
            this._switchView(FreeCourse)
        })
    },

    vipCourse() {
        common.loading()
        require.ensure(['./contentManage/vipCourse/VipCourse'], require => {
            const { VipCourse } = require('./contentManage/vipCourse/VipCourse')
            this._switchView(VipCourse)
        })
    },

    bonus() {
        common.loading()
        require.ensure(['./contentManage/bonus/index'], require => {
            const { Bonus } = require('./contentManage/bonus/index')
            this._switchView(Bonus)
        })
    },

    selectedTopics() {
        common.loading()
        require.ensure(['./selectedTopics/index'], require => {
            const { SelectedTopics } = require('./selectedTopics/index')
            this._switchView(SelectedTopics)
        })
    },
    boardPosts(postType) {
        common.loading()
        require.ensure(['./communityManage/boardPosts/index'], require => {
            const { BoardPosts } = require('./communityManage/boardPosts/index')
            this._switchView(BoardPosts, { postType })
        })
    },

    firstBoard() {
        common.loading()
        require.ensure(['./communityManage/firstBoard/index'], require => {
            const { FirstBoard } = require('./communityManage/firstBoard/index')
            this._switchView(FirstBoard)
        })
    },

    firstBoardAndCollege(id, name, associateCollegeId) {
        common.loading()
        require.ensure(
            ['./communityManage/firstBoardAndCollege/index'],
            require => {
                const {
                    FirstBoardAndCollege,
                } = require('./communityManage/firstBoardAndCollege/index')
                this._switchView(FirstBoardAndCollege, {
                    id,
                    name,
                    associateCollegeId,
                })
            },
        )
    },

    secondBoard() {
        common.loading()
        require.ensure(['./communityManage/secondBoard/index'], require => {
            const {
                SecondBoard,
            } = require('./communityManage/secondBoard/index')
            this._switchView(SecondBoard)
        })
    },

    // 用户成长体系
    userGrowth(type) {
        common.loading()
        require.ensure(['./communityManage/userGrowth/index'], require => {
            const { UserGrowth } = require('./communityManage/userGrowth/index')
            this._switchView(UserGrowth, { type })
        })
    },

    myConversation() {
        common.loading()
        require.ensure(['./messageManage/conversation/index'], require => {
            const {
                Conversation,
            } = require('./messageManage/conversation/index')
            this._switchView(
                Conversation,
                { role: 'teacher' },
                'myConversation',
            )
        })
    },

    dutyTeacherConversation() {
        common.loading()
        require.ensure(['./messageManage/conversation/index'], require => {
            const {
                Conversation,
            } = require('./messageManage/conversation/index')
            this._switchView(
                Conversation,
                { role: 'dutyteacher' },
                'dutyTeacherConversation',
            )
        })
    },

    afterSaleTeacherConversation() {
        common.loading()
        require.ensure(['./messageManage/conversation/index'], require => {
            const {
                Conversation,
            } = require('./messageManage/conversation/index')
            this._switchView(
                Conversation,
                { role: 'afterSaleTeacher' },
                'afterSaleTeacherConversation',
            )
        })
    },

    imStat() {
        common.loading()
        require.ensure(['./messageManage/imStat/index'], require => {
            const { IMStat } = require('./messageManage/imStat/index')
            this._switchView(IMStat)
        })
    },

    historyMessage() {
        common.loading()
        // require.ensure(['./messageManage/historyMessage/index'], (require) => {
        //   let {HistoryMessage} = require('./messageManage/historyMessage/index');
        //   this._switchView(HistoryMessage);
        // })

        require.ensure(['./messageManage/chatMessage/index'], require => {
            const {
                HistoryMessage,
            } = require('./messageManage/chatMessage/index')
            this._switchView(HistoryMessage)
        })
    },

    dataStatistic() {
        common.loading()
        require.ensure(['./messageManage/dataStatistic/index'], require => {
            const {
                DataStatistic,
            } = require('./messageManage/dataStatistic/index')
            this._switchView(DataStatistic)
        })
    },

    sensitiveDictionary() {
        common.loading()
        require.ensure(['./sensitiveWords/index'], require => {
            const { SensitiveWords } = require('./sensitiveWords/index')
            this._switchView(SensitiveWords)
        })
    },

    teacherOnDutyMan() {
        common.loading()
        require.ensure(['./dutyTeacher/teacherOnDutyMan/index'], require => {
            const {
                TeacherOnDutyMan,
            } = require('./dutyTeacher/teacherOnDutyMan/index')
            this._switchView(TeacherOnDutyMan)
        })
    },

    dutyTeacherHistory() {
        // common.loading();
        // require.ensure(['./dutyTeacher/dutyTeacherHistory/index'], (require) => {
        //   let {DutyTeacherHistory} = require('./dutyTeacher/dutyTeacherHistory/index');
        //   this._switchView(DutyTeacherHistory);
        // })
        this.historyMessage()
    },

    // 欢迎语
    welcomeMessage() {
        common.loading()
        require.ensure(['./dutyTeacher/welcomeMessage/index'], require => {
            const {
                WelcomeMessage,
            } = require('./dutyTeacher/welcomeMessage/index')
            this._switchView(WelcomeMessage)
        })
    },

    // 群聊
    groupInitor() {
        common.loading()
        require.ensure(['./groupTalk/groupInitor/index'], require => {
            const { GroupInitor } = require('./groupTalk/groupInitor/index')
            this._switchView(GroupInitor)
        })
    },

    myGroupTalk(groupId) {
        common.loading()
        require.ensure(['./groupTalk/myGroupTalk/index'], require => {
            const { MyGroupTalk } = require('./groupTalk/myGroupTalk/index')
            this._switchView(MyGroupTalk, { groupId })
        })
    },

    // 群发消息
    groupMessageList() {
        common.loading()
        require.ensure(
            ['./messageManage/groupMessage/groupMessageList/index'],
            require => {
                const {
                    GroupMessageList,
                } = require('./messageManage/groupMessage/groupMessageList/index')
                this._switchView(GroupMessageList)
            },
        )
    },

    // 创建群发
    // createGroupMessageList: function (argument) {
    //     common.loading();
    //     require.ensure(['./messageManage/groupMessage/groupMessageList/createGroupMessage/index'], (require) => {
    //         let { Sender } = require('./messageManage/groupMessage/groupMessageList/createGroupMessage/index');
    //         this._switchView(Sender);
    //     })
    // },

    notifyFilesList() {
        common.loading()
        require.ensure(
            ['./messageManage/groupMessage/notifyFilesList/index'],
            require => {
                const {
                    NotifyFilesList,
                } = require('./messageManage/groupMessage/notifyFilesList/index')
                this._switchView(NotifyFilesList)
            },
        )
    },

    notifyFilesListSys() {
        common.loading()
        require.ensure(
            ['./messageManage/groupMessage/notifyFilesListSys/index'],
            require => {
                const {
                    NotifyFilesList,
                } = require('./messageManage/groupMessage/notifyFilesListSys/index')
                this._switchView(NotifyFilesList)
            },
        )
    },

    groupMessagePublish(fileId, sendUserType) {
        common.loading()
        require.ensure(
            ['./messageManage/groupMessage/publish/index'],
            require => {
                const {
                    Publish,
                } = require('./messageManage/groupMessage/publish/index')
                this._switchView(Publish, { fileId, sendUserType })
            },
        )
    },

    iosReview() {
        common.loading()
        require.ensure(['./reviewManage/ios/index'], require => {
            const { IOSReview } = require('./reviewManage/ios/index')
            this._switchView(IOSReview)
        })
    },

    questions(questionId) {
        common.loading()
        require.ensure(
            ['./communityManage/question/questions/index'],
            require => {
                const {
                    Questions,
                } = require('./communityManage/question/questions/index')
                this._switchView(Questions, { questionId })
            },
        )
    },

    answers() {
        common.loading()
        require.ensure(
            ['./communityManage/question/answers/index'],
            require => {
                const {
                    Answers,
                } = require('./communityManage/question/answers/index')
                this._switchView(Answers)
            },
        )
    },
    // 图片审核
    pictureAudit(type) {
        common.loading()
        require.ensure(['./communityManage/pictureAudit/index'], require => {
            const {
                PictureAudit,
            } = require('./communityManage/pictureAudit/index')
            this._switchView(PictureAudit, { type })
        })
    },

    picReport(type) {
        common.loading()
        require.ensure(['./communityManage/picReport/index'], require => {
            const { PicReport } = require('./communityManage/picReport/index')
            this._switchView(PicReport, { type })
        })
    },

    afterSaleTeacher(type, id) {
        common.loading()
        require.ensure(['./afterSaleTeacher/index'], require => {
            const { AfterSaleTeacher } = require('./afterSaleTeacher/index')
            this._switchView(AfterSaleTeacher, {})
        })
    },

    beforelesson(type, id) {
        common.loading()
        require.ensure(['./beforelesson/index'], require => {
            const { Beforelesson } = require('./beforelesson/index')
            this._switchView(Beforelesson, {})
        })
    },

    beforelessonEdit(typeId, majorId) {
        common.loading()
        require.ensure(['./beforelesson/edit/index'], require => {
            const { BeforelessonEdit } = require('./beforelesson/edit/index')
            this._switchView(BeforelessonEdit, { typeId, majorId })
        })
    },

    // 案例库
    caseHub(pageNo, pageSize) {
        common.loading()
        require.ensure(['./caseHub/index'], require => {
            const { CaseHub } = require('./caseHub/index')
            this._switchView(CaseHub, {})
        })
    },

    // 案例库-add/edit
    caseHubAdd(type, pageNo, pageSize, postid, caseid) {
        common.loading()
        require.ensure(['./caseHub/add/index'], require => {
            const { CaseHubAdd } = require('./caseHub/add/index')
            this._switchView(CaseHubAdd, { type, postid, caseid })
        })
    },

    // 案例展示页
    caseHubOper() {
        common.loading()
        require.ensure(['./caseHubOper/index'], require => {
            const { CaseHubOper } = require('./caseHubOper/index')
            this._switchView(CaseHubOper, {})
        })
    },

    patter() {
        common.loading()
        require.ensure(['./messageManage/patter/index'], require => {
            const { Patter } = require('./messageManage/patter/index')
            this._switchView(Patter, {})
        })
    },

    tag() {
        common.loading()
        require.ensure(['./messageManage/tag/index'], require => {
            const { Tag } = require('./messageManage/tag/index')
            this._switchView(Tag, {})
        })
    },

    storyNotice() {
        common.loading()
        require.ensure(['./communityManage/storyNotice/index'], require => {
            const { StoryNotice } = require('./communityManage/storyNotice/index')
            this._switchView(StoryNotice, {})
        })
    },

    _switchView(View, param, specialHash = '') {
        common.removeLoading()

        // 权限兼容，规避老师收藏 @gushochuang
        // 是要处理的特殊hash，且没在后端返回的siteMap中
        if (
            specialHash &&
            window.userInfo.siteMap.indexOf(`#${specialHash}`) === -1
        ) {
            // 由于sso登出后再登录，会携带原页面的hash，所以在logout前，先把hash干了。
            window.location.hash = ''
            // logout
            if (header && header.logout) {
                header.logout()
            }
            return
        }

        if (currentView) {
            if (currentView.remove) {
                currentView.remove()
            }

            if (currentView.destroy) {
                currentView.destroy()
            }
        }
        $main
            .children()
            .filter((index, ele) => ele.id !== 'react-container')
            .remove()
        const view = new View(param)
        $main.append(view.$el)
        currentView = view
    },
})

const router = new Router()
export { router }
