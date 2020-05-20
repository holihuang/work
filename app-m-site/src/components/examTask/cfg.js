import signIcon from 'Images/examTask/sign.png'
import sportsIcon from 'Images/examTask/sports.png'
import lessonIcon from 'Images/examTask/lesson.png'
import writeIcon from 'Images/examTask/write.png'
import thumbIcon from 'Images/examTask/thumb.png'
import commentIcon from 'Images/examTask/comment.png'
import videoIcon from 'Images/examTask/video.png'
import bonusIcon from 'Images/examTask/bonus.png'
import battleIcon from 'Images/examTask/battle.png'
import commonWealIcon from 'Images/examTask/commonWeal.png'
import studyGroupIcon from 'Images/examTask/studyGroup.png'
import sprintIcon from 'Images/examTask/sprint.png'

export default {
    docTitle: '任务列表',
    title: '集卡任务',
    states: {
        0: {
            share: '去分享',
            shareClass: '去分享',
            exchangeTiku: '去兑换',
            praise: '去点赞',
            topic: '去发帖',
            video: '去观看',
            bonus: '去参加',
            battle: '去参加',
            commonWeal: '去捐献',
            studyGroup: '去加入',
            sprint: '去参加',
        },
        1: '领取',
        2: '已完成'
    },
    shares: {
        share: {
            channel: 14,
            type: 'share'
        },
        shareClass: {
            type: 'shareClass',
            channel: 6,
        },
    },
    exchanges: {
        exchangeTiku: {},
    },
    icons: {
        daySign: signIcon, // 每日签到
        share: sportsIcon, // 分享活动
        shareClass: lessonIcon, // 分享3次小课
        exchangeTiku: writeIcon, // 答题数量兑换
        praise: thumbIcon, // 给帖子点赞5次
        topic: commentIcon, // 发布1篇话题贴
        video: videoIcon, // 观看考前小视频
        bonus: bonusIcon, // 学习赚奖金
        battle: battleIcon, // 挑战学霸大乱斗
        commonWeal: commonWealIcon, // 给尚进生献爱心
        studyGroup: studyGroupIcon, // 加入学习小组
        sprint: sprintIcon, // 参与考前冲刺
    },
}