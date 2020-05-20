import { Toast } from 'antd-mobile'
import platform from './platform'

export default {
    /*
    ** @versionAbove: 比较当前APP版本和目标APP版本高低（>=返回true）
    ** @version：要比较的目标app版本
    */
    versionAbove(version = '') {
        if (typeof version !== 'string') {
            console.error('传入的app版本不是字符串类型！')
            return
        }
        const { detailInfo: { deviceInfo = {} } } = platform()
        const { appVersion = '. .' } = deviceInfo
        if (!appVersion.length) {
            console.warn('当前不是app环境哦，版本比较无意义！')
        }
        /*
        ** @app版本格式
        ** @线上: '3.2.5'
        ** @测试: '3.2.5-debug'
        */
        const currentVersionArr = appVersion.split('.').map(item => {
            const reg = /\D/
            const regG = /\D/g
            if (reg.test(item)) {
                return item.replace(regG, '')
            }
            return item
        })
        const checkVersionArr = version.split('.')
        const deltVersionArr = currentVersionArr.map((item, index) => +item - (+checkVersionArr[index]))
        for (let i = 0; i < deltVersionArr.length; i++) {
            if (deltVersionArr[i] > 0) {
                return true
            } else if (deltVersionArr[i] === 0) {
                if (i === deltVersionArr.length - 1) {
                    return true
                }
                continue
            } else if (deltVersionArr[i] < 0) {
                return false
            }
        }
    },
    /*
    ** @appShare: app内分享h5
    ** @opt: { hooks, params },
        hooks: { succeedCallback, failedCallback, canceledCallback }
        params: { title, content, url, imgUrl, channel }
    */
    appShare(opt = {}) {
        const { hooks = {}, params } = opt
        const nameSet = {}
        if (typeof JSBridge !== 'undefined') {
            const now = new Date().getTime()
            Object.keys(hooks).forEach(item => {
                window[`${item}${now}`] = hooks[item]
                nameSet[item] = `${item}${now}`
            })
            JSBridge.doAction('actionShare', JSON.stringify({
                succeedCallback: nameSet.succeedCallback,
                failedCallback: nameSet.failedCallback,
                canceledCallback: nameSet.canceledCallback,
            }), JSON.stringify({
                title: '',
                content: '',
                url: '',
                imgUrl: '',
                channel: 14,
                ...params,
            }))
        }
    },
    /*
    ** @wxShare: wx内分享h5
    ** @opt: { cfg, data }
    */
    wxShare(opt = {}) {
        const { cfg = {}, data = {} } = opt
        // js sdk是否加载完成
        if (!window.wx) {
            return
        }
        const content = {
            title: '',
            link: '',
            imgUrl: '',
            success: () => {},
        }
        wx.config({
            appId: '',
            timestamp: '',
            nonceStr: '',
            signature: '',
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'],
            ...cfg,
        })
        wx.ready(() => {
            const { jsApiList = [] } = cfg
            jsApiList.forEach(item => {
                wx[item]({ ...content, ...data })
            })
        })
        wx.error(res => {
            Toast.error(res)
        })
    },

    /*
    ** @goToNative: 跳转到native具体页面
    ** @opt: { page, hooks, data, actionType } actionType:默认gotoNative
       hooks: { succeedCallback, failedCallback, canceledCallback } 不限于左边三个参数，succeedCallback肯定有，其他参数不一定有
    */
    goToNative(opt = {}) {
        const {
            page = '', hooks = {}, actionType = 'gotoNative',
            data = {},
        } = opt
        const dataStr = JSON.stringify(data)
        if (typeof JSBridge !== 'undefined') {
            const list = [page]
            if (actionType === 'gotoNative') {
                list.push(dataStr)
            } else if (actionType === 'doAction') {
                const nameSet = {}
                const now = new Date().getTime()
                Object.keys(hooks).forEach(item => {
                    window[`${item}${now}`] = hooks[item]
                    nameSet[item] = `${item}${now}`
                })

                // 其他回调参数（succeedCallback，failedCallback，canceledCallback 之外的参数 ）
                const otherHookKeys = Object.keys(hooks)
                    .filter(item => item !== 'succeedCallback' && item !== 'failedCallback' && item !== 'canceledCallback')

                const others = otherHookKeys.reduce((res, item) => ({ ...res, [item]: nameSet[item] }), {})

                list.push(JSON.stringify({
                    succeedCallback: nameSet.succeedCallback,
                    failedCallback: nameSet.failedCallback,
                    canceledCallback: nameSet.canceledCallback,
                    ...others,
                }), dataStr)
            }
            JSBridge[actionType](...list)
        }
    },
}
