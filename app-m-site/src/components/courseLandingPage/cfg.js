const highLightColor = '#301BDF'

import guide1 from '../../images/guide_itm_1.gif'
import guide2 from '../../images/guide_itm_2.gif'
import guide3 from '../../images/guide_itm_3.gif'
import guide4 from '../../images/guide_itm_4.gif'
import guide5 from '../../images/guide_itm_5.gif'
import guide6 from '../../images/guide_itm_6.gif'
import guide7 from '../../images/guide_itm_7.png'
import decPic1 from '../../images/dec_1.png'
import decPic2 from '../../images/dec_2.png'
import decPic3 from '../../images/dec_3.png'
import decPic4 from '../../images/dec_4.png'
import decPic5 from '../../images/dec_5.png'
import decPic6 from '../../images/dec_6.png'


export default {
    guideCover: `<div>等了许久，终于可以与你一起结伴而行，一起乘风破浪。</div><div>当你来到这里，想必还有诸多的疑问和不解。</div><div>那么，让我给你介绍一下，相信对于新生的你有很大帮助。</div>`,
    guideList: [{
        title: '如何找老师?',
        text: `当你遇到疑难问题不知所措时，都可以在 <span style="color:${highLightColor}"><b>“消息-我的老师”</b></span> 模块里找到班主任老师，他们会第一时间帮你解决。`,
        pic: guide1,
        decPic: decPic1,
        mainPicInRight: true, 
    }, {
        title: '怎么上课？',
        text: `我们所有线上课程全程在尚德机构APP进行，打开<span style="color:${highLightColor}"><b>“学习”</b></span>即可了解课程安排呢。另外，<span style="color: ${highLightColor}"><b>【开学典礼】</b></span>的直播一定要参加，这是与老师、同学们的首次见面哦~`,
        pic: guide2,
        decPic: decPic2,
        mainPicInRight: false,
    }, {
        title: '学习资料在哪里？',
        text: `同学，点击<span style="color:${highLightColor}"><b>“学习-资料下载”</b></span>，里面各种真题、笔记，应有尽有。下载到本地，想怎么看就怎么看。`,
        pic: guide3,
        decPic: decPic3,
        mainPicInRight: true,
    }, {
        title: '平时没直播课怎么办？',
        text: `我们可以选择<span style="color: ${highLightColor}"><b>收看重播</b></span>，或者打开<span style="color: ${highLightColor}"><b>“我的-题库”</b></span>答题练习。毕竟知识不是一蹴而就，温故而知新更牢固。`,
        pic: guide4,
        decPic: decPic4,
        mainPicInRight: false,
    }, {
        title: '老师会提醒我学习吗？',
        text: `关注微信公众号：<span style="color: ${highLightColor}"><b>尚德机构官网</b></span>（或者微信搜索 sdjggw），绑定手机号即可第一时间接收到<span style="color: ${highLightColor}"><b>上课提醒、报考通知、成绩查询</b></span>等重要通知。这很重要哦同学~`,
        pic: guide5,
        decPic: decPic5,
        mainPicInRight: true,
    }, {
        title: '在APP还可以做哪些？',
        text: `· <span style="color: ${highLightColor}"><b>坚持签到</b></span>，培养自己成为自律的人;<br/>· <span style="color: ${highLightColor}"><b>发帖回帖</b></span>，记录下学习时光的点滴；<br/>·<span style="color: ${highLightColor}"> <b>社群聊天</b></span>，认识更多有梦想的同学。`,
        pic: guide6,
        decPic: decPic6,
        mainPicInRight: false,
    }, {
        title: '文字讲解太枯燥？',
        text: `打开<span style="color: ${highLightColor}"><b>“学习-活动课-【新生学习指南】”</b></span><br/>你想要的全在视频里~`,
        pic: guide7,
        onlyOnePic: true,
    }],
    btnTxt: '立即关注微信公众号',
}