/*
 * @Author: litingwei
 * @Date: 2019-09-16 16:27:27
 * @LastEditTime: 2019-09-24 14:41:35
 * @LastEditors: litingwei
 */

export default {
    noListTxt: '当前没有待审核的帖子啦~',
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
    },
    envLabelSet: {
        sunlandapp: '主版app',
        liteapp: '极速版app',
        empapp: '员工版app',
        wx: '微信',
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