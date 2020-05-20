export default {
    noListTxt: '还没有发过帖子哦~ ',
    studyInfoList: [{
        key: 'attendTime',
        label: '课时',
    }, {
        key: 'questionCount',
        label: '做题',
    }, {
        key: 'postAmount',
        label: '发帖',
    }, {
        key: 'medalCount',
        label: '勋章',
    }],
    envKeySet: {
        sunlandapp: 'userId', // 主版app
        liteapp: 'userId', // 极速版app
        empapp: 'email263', // 员工版app
        wx: 'openId', // 微信
        skynet: 'email263', // 天网精灵
    },
    envLabelSet: {
        sunlandapp: '主版app',
        liteapp: '极速版app',
        empapp: '员工版app',
        wx: '微信',
        skynet: '天网精灵', //天网精灵
    },
    shareInfo: {
        baseWxTest: 'http://wxtest.ministudy.com',
        baseWxOnline: 'http://wx.sunlands.com',
        sharedImgUrl: 'http://store.sunlands.com/common/logo-sunlands.jpg',
        title: '在尚德，千万学子等你一起学习',
        contentKey: 'nickName',
        imgKey: 'imageUrl', // 图片字段
    },
}